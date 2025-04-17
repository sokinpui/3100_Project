// src/modules/DynamicDashboard/widgets/BudgetOverviewWidget.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, CircularProgress, LinearProgress, Grid, Tooltip } from '@mui/material';
import DonutSmallIcon from '@mui/icons-material/DonutSmall';
import axios from 'axios';
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';
import { isWithinInterval, startOfMonth, endOfMonth, parseISO, isValid } from 'date-fns'; // Import date functions
import { getCategoryDetails } from '../../../constants'; // Assuming you have this

const API_URL = 'http://localhost:8000';

export default function BudgetOverviewWidget({ userId, expenses, timePeriod }) {
    const { t } = useTranslation();
    const [budgets, setBudgets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Determine the relevant period for budget calculation (default to current month if timePeriod invalid)
    const budgetInterval = useMemo(() => {
        if (timePeriod?.startDate && timePeriod?.endDate && isValid(timePeriod.startDate) && isValid(timePeriod.endDate)) {
            return { start: timePeriod.startDate, end: timePeriod.endDate };
        }
        // Default to current month if timePeriod is not set or invalid
        const now = new Date();
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }, [timePeriod]);


    useEffect(() => {
        const fetchBudgets = async () => {
            if (!userId) return;
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${API_URL}/budgets/${userId}`);
                // TODO: Filter budgets based on the active period (budgetInterval)
                setBudgets(response.data);
            } catch (err) {
                console.error("Error fetching budgets:", err);
                setError(t('dynamicDashboard.fetchError'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchBudgets();
    }, [userId, t]);

    // Calculate spending per category within the budgetInterval
    const spendingByCategory = useMemo(() => {
        return expenses.reduce((acc, exp) => {
            try {
                 const expDate = parseISO(exp.date);
                 // Only include expenses within the determined budget interval
                 if (isValid(expDate) && isWithinInterval(expDate, budgetInterval)) {
                    const category = exp.category_name || 'Uncategorized';
                    const amount = parseFloat(exp.amount) || 0;
                    acc[category] = (acc[category] || 0) + amount;
                 }
            } catch (e) { console.error("Error processing expense for budget:", e); }
            return acc;
        }, {});
    }, [expenses, budgetInterval]);

    const getProgressColor = (progress) => {
        if (progress > 100) return 'error';
        if (progress > 85) return 'warning';
        return 'primary';
    };

     const getTranslatedCategory = (name) => {
        const details = getCategoryDetails(name); // Use your constants helper
        const key = details ? `expenseManager.category_${details.key}` : 'expenseManager.category_unknown';
        return t(key, { defaultValue: name });
     }


    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress size={30} /></Box>;
    }
    if (error) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 1, textAlign: 'center' }}><Typography color="error" variant="caption">{error}</Typography></Box>;
    }
    if (budgets.length === 0) {
        return (
             <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', p: 2, textAlign: 'center' }}>
                <DonutSmallIcon color="disabled" sx={{ fontSize: 30, mb: 1 }} />
                <Typography color="text.secondary" variant="body2">
                    <T>dynamicDashboard.noBudgetsSet</T> {/* Add new translation key */}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', overflowY: 'auto', p: 1 }}>
            <Grid container spacing={2}>
                {budgets.map((budget) => {
                    const spent = spendingByCategory[budget.category_name] || 0;
                    const limit = parseFloat(budget.amount_limit) || 0;
                    const progress = limit > 0 ? Math.min((spent / limit) * 100, 150) : 0; // Allow exceeding 100% visually
                    const remaining = Math.max(0, limit - spent);
                    const overspent = Math.max(0, spent - limit);

                    return (
                        <Grid item xs={12} key={budget.id}>
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2" fontWeight={500}>
                                        {getTranslatedCategory(budget.category_name)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        ${spent.toFixed(2)} / ${limit.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Tooltip title={`${progress.toFixed(0)}%`} placement="top">
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min(progress, 100)} // Cap visual bar at 100%
                                        color={getProgressColor(progress)}
                                        sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
                                    />
                                </Tooltip>
                                 <Typography variant="caption" color="text.secondary">
                                    {overspent > 0
                                        ? `${t('dynamicDashboard.overBudgetBy')} $${overspent.toFixed(2)}` // Add key
                                        : `${t('dynamicDashboard.remaining')}: $${remaining.toFixed(2)}`
                                    }
                                </Typography>
                            </Box>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}

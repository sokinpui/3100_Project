// src/modules/DynamicDashboard/widgets/NetCashFlowWidget.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import axios from 'axios';
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';
import { isWithinInterval, parseISO, isValid } from 'date-fns'; // Import date functions

const API_URL = 'http://localhost:8000';

export function NetCashFlowWidget({ userId, expenses, timePeriod }) {
    const { t } = useTranslation();
    const [income, setIncome] = useState([]);
    const [isLoadingIncome, setIsLoadingIncome] = useState(false);
    const [errorIncome, setErrorIncome] = useState(null);

    // Fetch Income data specifically for this widget
    useEffect(() => {
        const fetchIncome = async () => {
            if (!userId) return;
            setIsLoadingIncome(true);
            setErrorIncome(null);
            try {
                const response = await axios.get(`${API_URL}/income/${userId}`);
                setIncome(response.data || []);
            } catch (err) {
                console.error("Error fetching income:", err);
                setErrorIncome(t('dynamicDashboard.fetchError'));
            } finally {
                setIsLoadingIncome(false);
            }
        };
        fetchIncome();
    }, [userId, t]);

    // Filter income based on the dashboard's timePeriod
    const filteredIncome = useMemo(() => {
        if (!timePeriod?.startDate || !timePeriod?.endDate) {
            // If no time period (e.g., "All Time"), include all income
            // Adjust this logic if "All Time" should behave differently for cash flow
            return income;
        }
        const interval = { start: timePeriod.startDate, end: timePeriod.endDate };
        return income.filter(inc => {
            try {
                const incDate = parseISO(inc.date);
                return isValid(incDate) && isWithinInterval(incDate, interval);
            } catch { return false; }
        });
    }, [income, timePeriod]);

    // Calculate totals based on *filtered* data
    const totalIncome = useMemo(() => {
        return filteredIncome.reduce((sum, inc) => sum + (parseFloat(inc.amount) || 0), 0);
    }, [filteredIncome]);

    const totalExpenses = useMemo(() => {
        // expenses prop is already filtered by timePeriod in DynamicDashboard
        return expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    }, [expenses]);

    const netFlow = totalIncome - totalExpenses;

    // Use income loading state as the primary indicator here
    if (isLoadingIncome) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress size={30} /></Box>;
    }

    // Show error if income fetch failed
     if (errorIncome) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 1, textAlign: 'center' }}><Typography color="error" variant="caption">{errorIncome}</Typography></Box>;
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', p: 2, textAlign: 'center' }}>
             <CompareArrowsIcon sx={{ fontSize: 30, color: 'secondary.main', mb: 1 }} />
            <Typography variant="h5" fontWeight="bold" color={netFlow >= 0 ? 'success.main' : 'error.main'}>
                ${netFlow.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                <T>Income:</T> ${totalIncome.toFixed(2)} | <T>Expenses:</T> ${totalExpenses.toFixed(2)}
            </Typography>
             {(!timePeriod?.startDate || !timePeriod?.endDate) && (
                 <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>
                    (<T>All Time</T>) {/* Indicate if showing all time */}
                 </Typography>
             )}
        </Box>
    );
}

export default React.memo(NetCashFlowWidget);

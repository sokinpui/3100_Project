// src/modules/DynamicDashboard/widgets/BudgetComparisonWidget.jsx
import React, { useState, useMemo, useEffect } from 'react';
import {
    Box, Typography, CircularProgress, FormControl, InputLabel, Select, MenuItem, Paper
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { useTranslation } from 'react-i18next';
import T from '../../../utils/T';
import { format, parseISO, isValid, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, getMonth, getYear, isWithinInterval, isSameYear, isSameQuarter, isSameMonth } from 'date-fns';
import { useTheme } from '@mui/material/styles'; // Keep this import
import { getCategoryDetails } from '../../../constants';
import { useLocalizedDateFormat } from '../../../utils/useLocalizedDateFormat'; // Import date format hook

// Helper to get quarter number (1-4)
const getQuarter = (date) => Math.floor(getMonth(date) / 3) + 1;

// Helper to format period labels - Uses the hook now
const formatPeriodLabel = (periodKey, periodType, formatLocaleDate) => { // Pass formatLocaleDate
    try {
        if (periodType === 'monthly') {
            const [year, month] = periodKey.split('-');
            // Use the localized formatter
            return formatLocaleDate(new Date(parseInt(year), parseInt(month) - 1), 'MMM yyyy');
        } else if (periodType === 'quarterly') {
            const [year, quarter] = periodKey.split('-Q');
            // Format year, but quarter is just a number
            return `Q${quarter} ${formatLocaleDate(new Date(parseInt(year), 0), 'yyyy')}`; // Format year part
        } else if (periodType === 'yearly') {
             // Format the year
            return formatLocaleDate(new Date(parseInt(periodKey), 0), 'yyyy');
        }
    } catch (e) {
        console.error("Error formatting period label:", e);
        return periodKey; // Fallback
    }
    return periodKey;
};


// Custom Tooltip Component - ACCEPT theme prop
const CustomTooltip = ({ active, payload, label, budgetAmount, currency = '$', theme }) => { // Add theme prop
    const { t } = useTranslation();
    if (active && payload && payload.length >= 2) {
        const budgetPayload = payload.find(p => p.dataKey === 'budgetAmount');
        const actualPayload = payload.find(p => p.dataKey === 'actualSpending');

        const actual = actualPayload?.value ?? 0;
        const budgeted = budgetPayload?.value ?? budgetAmount;

        const overUnder = actual - budgeted;
        const overUnderText = overUnder > 0
            ? `${t('dynamicDashboard.overBudgetBy')} ${currency}${overUnder.toFixed(2)}`
            : `${t('dynamicDashboard.underBudgetBy')} ${currency}${Math.abs(overUnder).toFixed(2)}`;

        // Define fallback colors IN CASE theme is not passed somehow
        const budgetColorFallback = '#8884d8';
        const actualColorFallback = '#82ca9d';
        const actualColor = actualPayload?.payload?.actualColor || theme?.palette?.error?.main || actualColorFallback; // Use theme

        return (
            <Paper elevation={3} sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="caption" display="block" gutterBottom>{label}</Typography>
                <Typography variant="body2" sx={{ color: budgetPayload?.color || theme?.palette?.primary?.main || budgetColorFallback }}> {/* Use theme */}
                    {t('dynamicDashboard.budgeted')}: {currency}{budgeted.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ color: actualColor }}>
                    {t('dynamicDashboard.actual')}: {currency}{actual.toFixed(2)}
                </Typography>
                <Typography variant="caption" sx={{ color: overUnder > 0 ? theme?.palette?.error?.main : theme?.palette?.success?.main }}> {/* Use theme */}
                    ({overUnderText})
                </Typography>
            </Paper>
        );
    }
    return null;
};


export function BudgetComparisonWidget({ budgets = [], expenses = [], isLoading }) {
    const { t } = useTranslation();
    const theme = useTheme(); // Get theme here in the main component
    const { format: formatLocaleDate } = useLocalizedDateFormat(); // Get localized date formatter
    const [selectedBudgetId, setSelectedBudgetId] = useState('');

    const availableBudgets = useMemo(() => {
        return budgets.filter(b => b.category_name);
    }, [budgets]);

    useEffect(() => {
        if (!selectedBudgetId && availableBudgets.length > 0) {
            setSelectedBudgetId(availableBudgets[0].id);
        }
        if (selectedBudgetId && !availableBudgets.some(b => b.id === selectedBudgetId)) {
             setSelectedBudgetId(availableBudgets.length > 0 ? availableBudgets[0].id : '');
        }
    }, [availableBudgets, selectedBudgetId]);

    const selectedBudget = useMemo(() => {
        return availableBudgets.find(b => b.id === selectedBudgetId);
    }, [selectedBudgetId, availableBudgets]);

    const chartData = useMemo(() => {
        if (!selectedBudget || !expenses || expenses.length === 0) return [];

        const { category_name, period: budgetPeriod, amount_limit } = selectedBudget;
        const budgetAmount = parseFloat(amount_limit) || 0;

        const categoryExpenses = expenses.filter(exp => exp.category_name === category_name);

        if (categoryExpenses.length === 0) return [];

        const groupedExpenses = categoryExpenses.reduce((acc, exp) => {
            try {
                const date = parseISO(exp.date);
                if (!isValid(date)) return acc;

                let periodKey = '';
                if (budgetPeriod === 'monthly') {
                    periodKey = format(date, 'yyyy-MM'); // Use standard format for key
                } else if (budgetPeriod === 'quarterly') {
                    periodKey = `${getYear(date)}-Q${getQuarter(date)}`;
                } else if (budgetPeriod === 'yearly') {
                    periodKey = format(date, 'yyyy');
                } else {
                    return acc;
                }

                const amount = parseFloat(exp.amount) || 0;
                acc[periodKey] = (acc[periodKey] || 0) + amount;

            } catch (e) { console.error("Error grouping expense:", e); }
            return acc;
        }, {});

        return Object.entries(groupedExpenses)
            .map(([periodKey, actualSpending]) => {
                const isOverBudget = actualSpending > budgetAmount;
                return {
                    periodKey: periodKey,
                    // Use the formatting helper with the locale formatter
                    periodLabel: formatPeriodLabel(periodKey, budgetPeriod, formatLocaleDate),
                    budgetAmount: budgetAmount,
                    actualSpending: actualSpending,
                    budgetColor: theme.palette.primary.light, // Use lighter primary for budget
                    actualColor: isOverBudget ? theme.palette.error.main : theme.palette.success.main,
                };
            })
            .sort((a, b) => a.periodKey.localeCompare(b.periodKey));

    }, [selectedBudget, expenses, theme.palette, formatLocaleDate]); // Added formatLocaleDate dependency


    const handleBudgetChange = (event) => {
        setSelectedBudgetId(event.target.value);
    };

    const getTranslatedCategory = (name) => {
        const details = getCategoryDetails(name);
        const key = details ? `expenseManager.category_${details.key}` : 'expenseManager.category_unknown';
        return t(key, { defaultValue: name });
     }

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress size={30}/></Box>;
    }

    if (availableBudgets.length === 0) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 2, textAlign: 'center' }}><Typography color="text.secondary"><T>dynamicDashboard.noBudgetsSet</T></Typography></Box>;
    }

    return (
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel id="budget-compare-select-label"><T>dynamicDashboard.selectBudgetToCompare</T></InputLabel>
                <Select
                    labelId="budget-compare-select-label"
                    value={selectedBudgetId}
                    label={t('dynamicDashboard.selectBudgetToCompare')}
                    onChange={handleBudgetChange}
                >
                    {availableBudgets.map((budget) => (
                        <MenuItem key={budget.id} value={budget.id}>
                             {getTranslatedCategory(budget.category_name)} ({t(`recurringManager.frequency_${budget.period}`)}) - ${parseFloat(budget.amount_limit).toFixed(0)}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {selectedBudget && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                        <XAxis dataKey="periodLabel" style={{ fontSize: '10px' }} tickMargin={5}/>
                        <YAxis style={{ fontSize: '10px' }} tickFormatter={(value) => `$${value.toFixed(0)}`} allowDecimals={false} />
                        {/* Pass theme down to the tooltip */}
                        <Tooltip content={<CustomTooltip budgetAmount={selectedBudget ? parseFloat(selectedBudget.amount_limit) : 0} theme={theme} />} cursor={{ fill: theme.palette.action.hover }}/>
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
                        <Bar dataKey="budgetAmount" name={t('dynamicDashboard.budgeted')} fill={theme.palette.primary.light} barSize={20}/> {/* Use lighter primary */}
                        <Bar dataKey="actualSpending" name={t('dynamicDashboard.actual')} barSize={20}>
                             {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.actualColor} />
                             ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            ) : selectedBudget ? (
                 <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                    <Typography color="text.secondary"><T>dynamicDashboard.noExpenseDataForCategory</T></Typography>
                 </Box>
            ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                    <Typography color="text.secondary"><T>dynamicDashboard.selectBudgetPrompt</T></Typography>
                 </Box>
            )}
        </Box>
    );
}

export default React.memo(BudgetComparisonWidget);

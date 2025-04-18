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
import { useTheme } from '@mui/material/styles';
import { getCategoryDetails } from '../../../constants';

// Helper to get quarter number (1-4)
const getQuarter = (date) => Math.floor(getMonth(date) / 3) + 1;

// Helper to format period labels
const formatPeriodLabel = (periodKey, periodType) => {
    try {
        if (periodType === 'monthly') {
            const [year, month] = periodKey.split('-');
            return format(new Date(parseInt(year), parseInt(month) - 1), 'MMM yy');
        } else if (periodType === 'quarterly') {
            const [year, quarter] = periodKey.split('-Q');
            return `Q${quarter} ${year}`;
        } else if (periodType === 'yearly') {
            return periodKey; // Year is the key itself
        }
    } catch (e) {
        console.error("Error formatting period label:", e);
        return periodKey; // Fallback
    }
    return periodKey;
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label, budgetAmount, currency = '$' }) => {
    const { t } = useTranslation();
    if (active && payload && payload.length) {
        const actual = payload[0]?.value || 0;
        const overUnder = actual - budgetAmount;
        const overUnderText = overUnder > 0
            ? `${t('dynamicDashboard.overBudgetBy')} ${currency}${overUnder.toFixed(2)}`
            : `${t('dynamicDashboard.underBudgetBy')} ${currency}${Math.abs(overUnder).toFixed(2)}`; // You'll need a new translation key for 'underBudgetBy'

        return (
            <Paper elevation={3} sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="caption" display="block" gutterBottom>{label}</Typography>
                <Typography variant="body2" sx={{ color: payload[0]?.payload?.budgetColor || '#8884d8' }}>
                    {t('dynamicDashboard.budgeted')}: {currency}{budgetAmount.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ color: payload[0]?.payload?.actualColor || '#82ca9d' }}>
                    {t('dynamicDashboard.actual')}: {currency}{actual.toFixed(2)}
                </Typography>
                <Typography variant="caption" sx={{ color: overUnder > 0 ? 'error.main' : 'success.main' }}>
                    ({overUnderText})
                </Typography>
            </Paper>
        );
    }
    return null;
};

export function BudgetComparisonWidget({ budgets = [], expenses = [], isLoading }) {
    const { t } = useTranslation();
    const theme = useTheme();
    const [selectedBudgetId, setSelectedBudgetId] = useState('');

    // Find available budgets (those with a category name)
    const availableBudgets = useMemo(() => {
        return budgets.filter(b => b.category_name);
    }, [budgets]);

    // Set default selection when budgets load
    useEffect(() => {
        if (!selectedBudgetId && availableBudgets.length > 0) {
            setSelectedBudgetId(availableBudgets[0].id);
        }
         // If the currently selected budget disappears, clear the selection
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

        // Filter expenses for the selected category
        const categoryExpenses = expenses.filter(exp => exp.category_name === category_name);

        if (categoryExpenses.length === 0) return []; // No expenses for this category

        // Group expenses by the budget's period type
        const groupedExpenses = categoryExpenses.reduce((acc, exp) => {
            try {
                const date = parseISO(exp.date);
                if (!isValid(date)) return acc;

                let periodKey = '';
                if (budgetPeriod === 'monthly') {
                    periodKey = format(date, 'yyyy-MM');
                } else if (budgetPeriod === 'quarterly') {
                    periodKey = `${getYear(date)}-Q${getQuarter(date)}`;
                } else if (budgetPeriod === 'yearly') {
                    periodKey = format(date, 'yyyy');
                } else {
                    return acc; // Skip if period type is unknown
                }

                const amount = parseFloat(exp.amount) || 0;
                acc[periodKey] = (acc[periodKey] || 0) + amount;

            } catch (e) {
                console.error("Error grouping expense:", e);
            }
            return acc;
        }, {});

        // Prepare data for the chart
        return Object.entries(groupedExpenses)
            .map(([periodKey, actualSpending]) => {
                const isOverBudget = actualSpending > budgetAmount;
                return {
                    periodKey: periodKey, // Keep original key for sorting
                    periodLabel: formatPeriodLabel(periodKey, budgetPeriod),
                    budgetAmount: budgetAmount,
                    actualSpending: actualSpending,
                    // Add colors for conditional cell styling
                    budgetColor: theme.palette.primary.main,
                    actualColor: isOverBudget ? theme.palette.error.main : theme.palette.success.main,
                };
            })
            .sort((a, b) => a.periodKey.localeCompare(b.periodKey)); // Sort chronologically

    }, [selectedBudget, expenses, theme.palette]);


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
                {/* Add translation key */}
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
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}> {/* Adjust margins */}
                        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                        <XAxis dataKey="periodLabel" style={{ fontSize: '10px' }} tickMargin={5}/>
                        <YAxis style={{ fontSize: '10px' }} tickFormatter={(value) => `$${value.toFixed(0)}`} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip budgetAmount={selectedBudget ? parseFloat(selectedBudget.amount_limit) : 0} />} cursor={{ fill: theme.palette.action.hover }}/>
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
                        <Bar dataKey="budgetAmount" name={t('dynamicDashboard.budgeted')} fill={theme.palette.primary.light} barSize={20}/>
                        <Bar dataKey="actualSpending" name={t('dynamicDashboard.actual')} barSize={20}>
                             {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.actualColor} />
                             ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            ) : selectedBudget ? (
                 <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                    {/* Add translation key */}
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

// src/modules/DynamicDashboard/widgets/SavingsRateWidget.jsx
import React from 'react';
import { Box, Typography, CircularProgress, Paper, Tooltip } from '@mui/material';
import SavingsIcon from '@mui/icons-material/Savings'; // Or TrendingUp/Down based on rate
import T from '../../../utils/T';
import { useTheme } from '@mui/material/styles';

export function SavingsRateWidget({ expenses = [], income = [], isLoading }) {
    const theme = useTheme();

    const { totalIncome, totalExpenses, netFlow, savingsRate, rateLabel } = React.useMemo(() => {
        const calculatedIncome = income.reduce((sum, inc) => sum + (parseFloat(inc.amount) || 0), 0);
        const calculatedExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
        const calculatedNetFlow = calculatedIncome - calculatedExpenses;

        let rate = 0;
        let label = 'N/A';

        if (calculatedIncome > 0) {
            rate = (calculatedNetFlow / calculatedIncome) * 100;
            label = `${rate.toFixed(1)}%`;
        } else if (calculatedExpenses > 0) {
            // Handle case with expenses but no income (infinite negative rate)
            label = '-∞%'; // Or just indicate loss
            rate = -Infinity;
        } else {
            // No income and no expenses
             label = '0%';
             rate = 0;
        }

        return {
            totalIncome: calculatedIncome,
            totalExpenses: calculatedExpenses,
            netFlow: calculatedNetFlow,
            savingsRate: rate,
            rateLabel: label,
        };
    }, [income, expenses]);

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress size={30}/></Box>;
    }

    const getRateColor = () => {
        if (savingsRate > 15) return theme.palette.success.main; // Good savings rate
        if (savingsRate > 0) return theme.palette.warning.main; // Low savings rate
        if (savingsRate <= 0) return theme.palette.error.main; // Losing money
        return theme.palette.text.primary;
    };

    const tooltipTitle = `Income: $${totalIncome.toFixed(2)} | Expenses: $${totalExpenses.toFixed(2)} | Net: $${netFlow.toFixed(2)}`;

    return (
        <Tooltip title={tooltipTitle} arrow placement="top">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', p: 2 }}>
                <Paper elevation={0} sx={{ bgcolor: 'transparent' }}>
                    <SavingsIcon sx={{ fontSize: 40, color: getRateColor(), mb: 1 }} />
                    {/* Add translation key */}
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        <T>dynamicDashboard.savingsRate</T>
                    </Typography>
                    <Typography variant="h4" component="div" fontWeight="bold" sx={{ color: getRateColor() }}>
                        {rateLabel}
                    </Typography>
                </Paper>
            </Box>
        </Tooltip>
    );
}

export default React.memo(SavingsRateWidget);

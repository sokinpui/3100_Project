// src/modules/DynamicDashboard/widgets/AverageDailyNetFlowWidget.jsx
import React, { useMemo } from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'; // Net flow icon
import { differenceInDays, parseISO, isValid, format } from 'date-fns';
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';

export function AverageDailyNetFlowWidget({ expenses = [], income = [], isLoading }) {
  const { t } = useTranslation();
  const theme = useTheme();

  const averageNetFlow = useMemo(() => {
    if ((!income || income.length === 0) && (!expenses || expenses.length === 0)) {
        return { avg: 0, days: 0 };
    }

    const dailyMap = {}; // Key: 'YYYY-MM-DD', Value: { income: X, expense: Y }
    let minDate = null;
    let maxDate = null;

    // Process Income
    income.forEach(inc => {
      try {
        const date = parseISO(inc.date);
        if (isValid(date)) {
            const dateString = format(date, 'yyyy-MM-dd');
            const amount = parseFloat(inc.amount) || 0;
            if (!dailyMap[dateString]) dailyMap[dateString] = { income: 0, expense: 0 };
            dailyMap[dateString].income += amount;
            if (!minDate || date < minDate) minDate = date;
            if (!maxDate || date > maxDate) maxDate = date;
        }
      } catch (e) { /* ignore */ }
    });

    // Process Expenses
    expenses.forEach(exp => {
      try {
        const date = parseISO(exp.date);
        if (isValid(date)) {
            const dateString = format(date, 'yyyy-MM-dd');
            const amount = parseFloat(exp.amount) || 0;
            if (!dailyMap[dateString]) dailyMap[dateString] = { income: 0, expense: 0 };
            dailyMap[dateString].expense += amount;
            if (!minDate || date < minDate) minDate = date;
            if (!maxDate || date > maxDate) maxDate = date;
        }
      } catch (e) { /* ignore */ }
    });


    if (!minDate || !maxDate) return { avg: 0, days: 0 };

    const days = differenceInDays(maxDate, minDate) + 1;
    if (days <= 0) return { avg: 0, days: 0 };

    // Calculate total net flow across all days in the map
    let totalNetFlow = 0;
    Object.values(dailyMap).forEach(totals => {
        totalNetFlow += (totals.income - totals.expense);
    });

    // Average over the calculated day range
    const avg = totalNetFlow / days;
    return { avg, days };

  }, [expenses, income]);

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
  }

   // Add specific translation key
   if (averageNetFlow.days < 2) {
      return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', p: 1 }}>
                <Typography color="text.secondary"><T>dynamicDashboard.notEnoughDataForNetFlowAverage</T></Typography>
             </Box>;
   }

   const netFlowColor = averageNetFlow.avg >= 0 ? theme.palette.success.main : theme.palette.error.main;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', p: 2 }}>
      <Paper elevation={0} sx={{ bgcolor: 'transparent' }}>
        <CompareArrowsIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
        <Typography variant="h4" component="div" fontWeight="bold" sx={{ color: netFlowColor }}>
          {averageNetFlow.avg >= 0 ? '+' : '-'}${Math.abs(averageNetFlow.avg).toFixed(2)}
        </Typography>
        {/* Use specific translation keys */}
        <Typography variant="body2" color="text.secondary" gutterBottom>
           <T>dynamicDashboard.perDay</T> (<T>dynamicDashboard.basedOnNetFlowDays</T> {averageNetFlow.days})
        </Typography>
      </Paper>
    </Box>
  );
}

export default React.memo(AverageDailyNetFlowWidget);

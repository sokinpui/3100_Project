// src/modules/DynamicDashboard/widgets/AverageDailySpendWidget.jsx
import React, { useMemo } from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate'; // Or ShowChartIcon
import { differenceInDays, parseISO, isValid } from 'date-fns';
import T from '../../../utils/T';

export default function AverageDailySpendWidget({ expenses, isLoading }) {

  const averageSpend = useMemo(() => {
    if (!expenses || expenses.length === 0) return { avg: 0, days: 0 };

    let minDate = null;
    let maxDate = null;
    let totalAmount = 0;

    expenses.forEach(exp => {
      const amount = parseFloat(exp.amount) || 0;
      totalAmount += amount;
      try {
        const date = parseISO(exp.date);
        if (isValid(date)) {
            if (!minDate || date < minDate) minDate = date;
            if (!maxDate || date > maxDate) maxDate = date;
        }
      } catch (e) {
        console.error("Error parsing date for average:", exp.date, e);
      }
    });

    if (!minDate || !maxDate) return { avg: 0, days: 0 }; // Not enough valid dates

    // Calculate difference in days + 1 to include both start and end day
    const days = differenceInDays(maxDate, minDate) + 1;

    if (days <= 0) return { avg: 0, days: 0 }; // Should not happen with valid dates, but safety check

    const avg = totalAmount / days;
    return { avg, days };

  }, [expenses]);

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
  }

   if (averageSpend.days < 2) { // Need at least 2 days for a meaningful average (or adjust threshold)
      return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', p: 1 }}>
                <Typography color="text.secondary"><T>dynamicDashboard.notEnoughDataForAverage</T></Typography>
             </Box>;
   }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', p: 2 }}>
      <Paper elevation={0} sx={{ bgcolor: 'transparent' }}>
        <CalculateIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
        <Typography variant="h4" component="div" fontWeight="bold">
          ${averageSpend.avg.toFixed(2)}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <T>dynamicDashboard.perDay</T> (<T>dynamicDashboard.basedOnDays</T> {averageSpend.days})
        </Typography>
      </Paper>
    </Box>
  );
}

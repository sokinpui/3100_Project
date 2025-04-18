// src/modules/DynamicDashboard/widgets/AverageDailyIncomeWidget.jsx
import React, { useMemo } from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp'; // Income icon
import { differenceInDays, parseISO, isValid } from 'date-fns';
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next'; // Import useTranslation

export default function AverageDailyIncomeWidget({ income = [], isLoading }) {
  const { t } = useTranslation(); // Get translation function

  const averageIncome = useMemo(() => {
    if (!income || income.length === 0) return { avg: 0, days: 0 };

    let minDate = null;
    let maxDate = null;
    let totalAmount = 0;

    income.forEach(inc => {
      const amount = parseFloat(inc.amount) || 0;
      totalAmount += amount;
      try {
        const date = parseISO(inc.date);
        if (isValid(date)) {
            if (!minDate || date < minDate) minDate = date;
            if (!maxDate || date > maxDate) maxDate = date;
        }
      } catch (e) {
        console.error("Error parsing date for average income:", inc.date, e);
      }
    });

    if (!minDate || !maxDate) return { avg: 0, days: 0 };

    const days = differenceInDays(maxDate, minDate) + 1;
    if (days <= 0) return { avg: 0, days: 0 };

    const avg = totalAmount / days;
    return { avg, days };

  }, [income]);

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
  }

   // Use a specific translation key
   if (averageIncome.days < 2) {
      return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', p: 1 }}>
                <Typography color="text.secondary"><T>dynamicDashboard.notEnoughDataForIncomeAverage</T></Typography>
             </Box>;
   }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', p: 2 }}>
      <Paper elevation={0} sx={{ bgcolor: 'transparent' }}>
        <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
        <Typography variant="h4" component="div" fontWeight="bold">
          ${averageIncome.avg.toFixed(2)}
        </Typography>
        {/* Use specific translation keys */}
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <T>dynamicDashboard.perDay</T> (<T>dynamicDashboard.basedOnIncomeDays</T> {averageIncome.days})
        </Typography>
      </Paper>
    </Box>
  );
}

import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Grid, Divider } from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import { useTranslation } from 'react-i18next';
import T from '../../../utils/T';
import { expenseCategories } from '../../../constants'; // Import the global expenseCategories

export default function SpendingForecast({ expenses }) {
  const { t } = useTranslation();
  const [forecast, setForecast] = useState({
    monthlyAverage: 0,
    currentMonth: {
      spent: 0,
      projected: 0,
      daysRemaining: 0,
      progress: 0,
      dateRange: '',
    },
    categories: [],
  });

  useEffect(() => {
    if (!expenses || expenses.length === 0) return;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const daysRemaining = daysInMonth - dayOfMonth;
    const monthProgress = (dayOfMonth / daysInMonth) * 100;

    // Use the earliest and latest dates from expenses for the current month
    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    let dateRange = '';
    if (currentMonthExpenses.length > 0) {
      const sortedExpenses = [...currentMonthExpenses].sort((a, b) => new Date(a.date) - new Date(b.date));
      const startDate = sortedExpenses[0].date;
      const endDate = sortedExpenses[sortedExpenses.length - 1].date;
      dateRange = `${startDate} - ${endDate}`;
    }

    const currentMonthTotal = currentMonthExpenses.reduce(
      (sum, expense) => sum + parseFloat(expense.amount), 0
    );

    const avgDailySpending = currentMonthTotal / dayOfMonth;
    const projectedMonthTotal = currentMonthTotal + (avgDailySpending * daysRemaining);

    const historicExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return !(expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear);
    });

    const expensesByMonth = historicExpenses.reduce((acc, expense) => {
      const expenseDate = new Date(expense.date);
      const monthKey = `${expenseDate.getFullYear()}-${expenseDate.getMonth()}`;
      if (!acc[monthKey]) acc[monthKey] = 0;
      acc[monthKey] += parseFloat(expense.amount);
      return acc;
    }, {});

    const monthlyTotals = Object.values(expensesByMonth);
    const monthlyAverage = monthlyTotals.length > 0
      ? monthlyTotals.reduce((sum, total) => sum + total, 0) / monthlyTotals.length
      : 0;

    const categoriesSpending = {};
    currentMonthExpenses.forEach(expense => {
      const categoryObj = expenseCategories.find(cat => cat.name === expense.category_name);
      const key = categoryObj ? categoryObj.key : expense.category_name.toLowerCase().replace(/ /g, '');
      const translatedCategory = t(`expenseManager.${key}`);
      if (!categoriesSpending[translatedCategory]) categoriesSpending[translatedCategory] = 0;
      categoriesSpending[translatedCategory] += parseFloat(expense.amount);
    });

    const categoryForecasts = Object.entries(categoriesSpending).map(([category, amount]) => {
      const dailyAvg = amount / dayOfMonth;
      const projected = amount + (dailyAvg * daysRemaining);
      return {
        category,
        spent: amount,
        projected,
        percentOfTotal: (amount / currentMonthTotal) * 100,
      };
    }).sort((a, b) => b.spent - a.spent);

    setForecast({
      monthlyAverage,
      currentMonth: {
        spent: currentMonthTotal,
        projected: projectedMonthTotal,
        daysRemaining,
        progress: monthProgress,
        dateRange,
      },
      categories: categoryForecasts.slice(0, 5),
    });
  }, [expenses, t]); // Removed the extra closing parenthesis

  return (
    <Card variant="outlined" sx={{ m: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <TimelineIcon sx={{ mr: 1 }} />
          <T>dashboard.spendingForecast.title</T>
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1">
              {forecast.currentMonth.dateRange || t('dashboard.spendingForecast.noData')}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={forecast.currentMonth.progress}
              sx={{ height: 10, borderRadius: 5, my: 1 }}
            />
            <Typography variant="caption" display="block">
              {t('dashboard.spendingForecast.daysRemaining', {
                count: forecast.currentMonth.daysRemaining,
              })}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                <T>dashboard.spendingForecast.spentSoFar</T>
              </Typography>
              <Typography variant="h5" color="primary">
                ${forecast.currentMonth.spent.toFixed(2)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                <T>dashboard.spendingForecast.projectedTotal</T>
              </Typography>
              <Typography
                variant="h5"
                color={forecast.currentMonth.projected > forecast.monthlyAverage ? 'error' : 'success'}
              >
                ${forecast.currentMonth.projected.toFixed(2)}
              </Typography>
              <Typography variant="caption" display="block">
                {forecast.currentMonth.projected > forecast.monthlyAverage ? (
                  t('dashboard.spendingForecast.aboveAverage', {
                    amount: (forecast.currentMonth.projected - forecast.monthlyAverage).toFixed(2),
                  })
                ) : (
                  t('dashboard.spendingForecast.belowAverage', {
                    amount: (forecast.monthlyAverage - forecast.currentMonth.projected).toFixed(2),
                  })
                )}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" gutterBottom>
              <T>dashboard.spendingForecast.topCategoryProjections</T>
            </Typography>

            {forecast.categories.length > 0 ? (
              forecast.categories.map((cat, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">{cat.category}</Typography>
                    <Typography variant="body2">
                      ${cat.spent.toFixed(2)} → ${cat.projected.toFixed(2)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={cat.percentOfTotal > 100 ? 100 : cat.percentOfTotal}
                    color={index % 2 === 0 ? 'primary' : 'secondary'}
                  />
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                <T>dashboard.spendingForecast.noCategoryData</T>
              </Typography>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Grid, Divider } from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';

export default function SpendingForecast({ expenses }) {
  const [forecast, setForecast] = useState({
    monthlyAverage: 0,
    currentMonth: {
      spent: 0,
      projected: 0,
      daysRemaining: 0,
      progress: 0
    },
    categories: []
  });

  useEffect(() => {
    if (!expenses || expenses.length === 0) return;

    // Get current date info
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const daysRemaining = daysInMonth - dayOfMonth;
    const monthProgress = (dayOfMonth / daysInMonth) * 100;

    // Filter expenses from the current month
    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    // Calculate current month's spending
    const currentMonthTotal = currentMonthExpenses.reduce(
      (sum, expense) => sum + parseFloat(expense.amount), 0
    );

    // Calculate average daily spending this month
    const avgDailySpending = currentMonthTotal / dayOfMonth;

    // Project total spending for the month
    const projectedMonthTotal = currentMonthTotal + (avgDailySpending * daysRemaining);

    // Calculate monthly average from historic data (exclude current month)
    const historicExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return !(expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear);
    });

    // Group historic expenses by month to calculate average
    const expensesByMonth = historicExpenses.reduce((acc, expense) => {
      const expenseDate = new Date(expense.date);
      const monthKey = `${expenseDate.getFullYear()}-${expenseDate.getMonth()}`;

      if (!acc[monthKey]) {
        acc[monthKey] = 0;
      }

      acc[monthKey] += parseFloat(expense.amount);
      return acc;
    }, {});

    const monthlyTotals = Object.values(expensesByMonth);
    const monthlyAverage = monthlyTotals.length > 0
      ? monthlyTotals.reduce((sum, total) => sum + total, 0) / monthlyTotals.length
      : 0;

    // Category-wise forecast
    const categoriesSpending = {};

    // Calculate spending by category this month
    currentMonthExpenses.forEach(expense => {
      const category = expense.category_name;
      if (!categoriesSpending[category]) {
        categoriesSpending[category] = 0;
      }
      categoriesSpending[category] += parseFloat(expense.amount);
    });

    // Format category data for display
    const categoryForecasts = Object.entries(categoriesSpending).map(([category, amount]) => {
      const dailyAvg = amount / dayOfMonth;
      const projected = amount + (dailyAvg * daysRemaining);

      return {
        category,
        spent: amount,
        projected,
        percentOfTotal: (amount / currentMonthTotal) * 100
      };
    }).sort((a, b) => b.spent - a.spent); // Sort by highest spending

    setForecast({
      monthlyAverage,
      currentMonth: {
        spent: currentMonthTotal,
        projected: projectedMonthTotal,
        daysRemaining,
        progress: monthProgress
      },
      categories: categoryForecasts.slice(0, 5) // Top 5 categories
    });
  }, [expenses]);

  return (
    <Card variant="outlined" sx={{ m: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <TimelineIcon sx={{ mr: 1 }} />
          Spending Forecast
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1">
              Month Progress ({Math.round(forecast.currentMonth.progress)}%)
            </Typography>
            <LinearProgress
              variant="determinate"
              value={forecast.currentMonth.progress}
              sx={{ height: 10, borderRadius: 5, my: 1 }}
            />
            <Typography variant="caption" display="block">
              {forecast.currentMonth.daysRemaining} days remaining this month
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Spent So Far
              </Typography>
              <Typography variant="h5" color="primary">
                ${forecast.currentMonth.spent.toFixed(2)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Projected Total
              </Typography>
              <Typography
                variant="h5"
                color={forecast.currentMonth.projected > forecast.monthlyAverage ? "error" : "success"}
              >
                ${forecast.currentMonth.projected.toFixed(2)}
              </Typography>
              <Typography variant="caption" display="block">
                {forecast.currentMonth.projected > forecast.monthlyAverage
                  ? `$${(forecast.currentMonth.projected - forecast.monthlyAverage).toFixed(2)} above average`
                  : `$${(forecast.monthlyAverage - forecast.currentMonth.projected).toFixed(2)} below average`
                }
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" gutterBottom>
              Top Category Projections
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
                    color={index % 2 === 0 ? "primary" : "secondary"}
                  />
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No category data available
              </Typography>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

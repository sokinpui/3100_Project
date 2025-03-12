import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import T from '../../../utils/T';

export default function ExpenseTrendAnalytics({ expenses }) {
  const [trendData, setTrendData] = useState([]);
  const theme = useTheme(); // Access MUI theme for dark mode

  useEffect(() => {
    if (expenses && expenses.length > 0) {
      const expensesByDate = expenses.reduce((acc, expense) => {
        const date = expense.date.split('T')[0]; // Handle ISO date format
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += parseFloat(expense.amount);
        return acc;
      }, {});

      const chartData = Object.keys(expensesByDate)
        .sort()
        .map(date => {
          const fullDate = new Date(date);
          return {
            date: fullDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'} ),
            amount: expensesByDate[date],
            fullDate: fullDate // Store full date for tooltip
          };
        });

      setTrendData(chartData);
    }
  }, [expenses]);

  // Custom Tooltip component
    const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box sx={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, padding: '8px', borderRadius: '4px', color: theme.palette.text.primary }}>
          <Typography variant="body2">
            {data.fullDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Typography>
          <Typography variant="body2">
            <T>dashboard.recentTransactions.amount</T>: ${data.amount.toFixed(2)}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card variant="outlined" sx={{ m: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          <T>dashboard.expenseTrendAnalytics.title</T>
        </Typography>
        {trendData.length > 0 ? (
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
                <YAxis stroke={theme.palette.text.secondary} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="amount" stroke={theme.palette.primary.main} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            <T>dashboard.expenseTrendAnalytics.noData</T> {/* Add this key if needed */}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ExpenseTrendAnalytics({ expenses }) {
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    if (expenses && expenses.length > 0) {
      // Group expenses by date and calculate daily totals
      const expensesByDate = expenses.reduce((acc, expense) => {
        const date = expense.date.split('T')[0]; // Handle ISO date format
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += parseFloat(expense.amount);
        return acc;
      }, {});

      // Convert to array format for LineChart
      const chartData = Object.keys(expensesByDate)
        .sort() // Sort dates chronologically
        .map(date => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          amount: expensesByDate[date]
        }));

      setTrendData(chartData);
    }
  }, [expenses]);

  return (
    <Card variant="outlined" sx={{ m: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          Expense Trends
        </Typography>
        {trendData.length > 0 ? (
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No trend data available
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

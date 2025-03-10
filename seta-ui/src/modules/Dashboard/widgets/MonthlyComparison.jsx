import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MonthlyComparison({ expenses }) {
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    if (expenses && expenses.length > 0) {
      // Group expenses by month and category
      const monthCategories = {};

      expenses.forEach(expense => {
        const date = new Date(expense.date);
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        const monthYear = `${month} ${year}`;
        const category = expense.category_name;

        if (!monthCategories[monthYear]) {
          monthCategories[monthYear] = {};
        }

        if (!monthCategories[monthYear][category]) {
          monthCategories[monthYear][category] = 0;
        }

        monthCategories[monthYear][category] += parseFloat(expense.amount);
      });

      // Convert to array format for BarChart
      const chartData = Object.keys(monthCategories).map(monthYear => {
        const dataPoint = { month: monthYear };
        Object.keys(monthCategories[monthYear]).forEach(category => {
          dataPoint[category] = monthCategories[monthYear][category];
        });
        return dataPoint;
      });

      // Sort by date
      chartData.sort((a, b) => {
        const [monthA, yearA] = a.month.split(' ');
        const [monthB, yearB] = b.month.split(' ');
        const dateA = new Date(`${monthA} 1, ${yearA}`);
        const dateB = new Date(`${monthB} 1, ${yearB}`);
        return dateA - dateB;
      });

      setMonthlyData(chartData);
    }
  }, [expenses]);

  // Dynamically get all unique categories
  const allCategories = monthlyData.length > 0
    ? Array.from(new Set(monthlyData.flatMap(data => Object.keys(data).filter(key => key !== 'month'))))
    : [];

  // Define colors for each category
  const categoryColors = {
    'Food': '#FF8042',
    'Transportation': '#0088FE',
    'Fuel': '#00C49F',
    'Shopping': '#FFBB28',
    'Housing': '#8884D8',
    'Healthcare': '#FF6B6B',
    'Education': '#6A5ACD',
    'Entertainment': '#82ca9d',
    'Utilities': '#ffc658',
    'Other': '#8dd1e1'
  };

  return (
    <Card variant="outlined" sx={{ m: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          Month-to-Month Comparison
        </Typography>
        {monthlyData.length > 1 ? (
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`]} />
                <Legend />
                {allCategories.map((category, index) => (
                  <Bar
                    key={category}
                    dataKey={category}
                    stackId="a"
                    fill={categoryColors[category] || `#${Math.floor(Math.random()*16777215).toString(16)}`}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Not enough data for month-to-month comparison
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MonthlyComparison({ expenses }) {
  const [monthlyData, setMonthlyData] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    if (expenses && expenses.length > 0) {
      const monthCategories = {};

      expenses.forEach(expense => {
        const date = new Date(expense.date);
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        const monthYear = `${month} ${year}`;
        const category = expense.category_name;

        if (!monthCategories[monthYear]) {
          monthCategories[monthYear] = { fullDate: date };
        }

        if (!monthCategories[monthYear][category]) {
          monthCategories[monthYear][category] = 0;
        }

        monthCategories[monthYear][category] += parseFloat(expense.amount);
      });

      const chartData = Object.keys(monthCategories).map(monthYear => {
        const dataPoint = { month: monthYear, fullDate: monthCategories[monthYear].fullDate };
        Object.keys(monthCategories[monthYear]).forEach(category => {
          if (category !== 'fullDate') {
            dataPoint[category] = monthCategories[monthYear][category];
          }
        });
        return dataPoint;
      });

      chartData.sort((a, b) => {
        return a.fullDate - b.fullDate;
      });

      setMonthlyData(chartData);
    }
  }, [expenses]);

  const allCategories = monthlyData.length > 0
    ? Array.from(new Set(monthlyData.flatMap(data => Object.keys(data).filter(key => key !== 'month' && key !== 'fullDate'))))
    : [];

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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = monthlyData.find(item => item.month === label);
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            padding: '8px',
            borderRadius: '4px',
            color: theme.palette.text.primary,
          }}
        >
          <Typography variant="body2">
            {data.fullDate.toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric'
            })}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2">
              {entry.name}: ${entry.value.toFixed(2)}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
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
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                <YAxis stroke={theme.palette.text.secondary} />
                <Tooltip content={<CustomTooltip />} />
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

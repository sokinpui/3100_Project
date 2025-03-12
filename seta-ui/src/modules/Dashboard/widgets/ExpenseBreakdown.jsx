import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import T from '../../../utils/T'; // Adjusted import path for widgets/ directory

export default function ExpenseBreakdown({ expenses }) {
  const [categoryData, setCategoryData] = useState([]);
  const [topExpenses, setTopExpenses] = useState([]);

  useEffect(() => {
    if (expenses && expenses.length > 0) {
      const categoryMap = expenses.reduce((acc, expense) => {
        const category = expense.category_name;
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += parseFloat(expense.amount);
        return acc;
      }, {});

      const chartData = Object.keys(categoryMap).map(category => ({
        name: category,
        value: categoryMap[category]
      }));

      const sortedExpenses = [...expenses].sort((a, b) =>
        parseFloat(b.amount) - parseFloat(a.amount)
      ).slice(0, 5);

      setCategoryData(chartData);
      setTopExpenses(sortedExpenses);
    }
  }, [expenses]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FCCDE5'];

  return (
    <Card variant="outlined" sx={{ m: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          <T>dashboard.expenseBreakdown.title</T>
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                <T>dashboard.expenseBreakdown.noData</T>
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              <T>dashboard.expenseBreakdown.topExpenses</T>
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><T>dashboard.expenseBreakdown.categories</T></TableCell>
                    <TableCell><T>dashboard.recentTransactions.description</T></TableCell>
                    <TableCell align="right"><T>dashboard.recentTransactions.amount</T></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topExpenses.length > 0 ? (
                    topExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{expense.category_name}</TableCell>
                        <TableCell>{expense.description || 'N/A'}</TableCell>
                        <TableCell align="right">${parseFloat(expense.amount).toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <T>dashboard.expenseBreakdown.noExpenses</T>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import RepeatIcon from '@mui/icons-material/Repeat';

export default function RecurringExpenses({ expenses }) {
  const [recurringItems, setRecurringItems] = useState([]);

  useEffect(() => {
    if (expenses && expenses.length > 0) {
      // This is a simplified algorithm to detect recurring expenses
      // A more sophisticated implementation would analyze patterns over longer periods

      // Group expenses by description and category
      const expenseGroups = expenses.reduce((acc, expense) => {
        const key = `${expense.category_name}-${expense.description}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(expense);
        return acc;
      }, {});

      // Filter for groups with multiple occurrences and similar amounts
      const recurring = Object.entries(expenseGroups)
        .filter(([key, group]) => group.length > 1)
        .map(([key, group]) => {
          // Calculate average amount
          const totalAmount = group.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
          const avgAmount = totalAmount / group.length;

          // Get the most recent occurrence
          const mostRecent = group.sort((a, b) =>
            new Date(b.date) - new Date(a.date)
          )[0];

          // Determine frequency based on date patterns
          const frequency = determineFrequency(group.map(exp => new Date(exp.date)));

          return {
            category: mostRecent.category_name,
            description: mostRecent.description || mostRecent.category_name,
            amount: avgAmount,
            frequency,
            occurrences: group.length,
            lastDate: new Date(mostRecent.date)
          };
        });

      setRecurringItems(recurring);
    }
  }, [expenses]);

  // Simple function to determine expense frequency
  const determineFrequency = (dates) => {
    if (dates.length < 2) return 'Unknown';

    // Sort dates in ascending order
    dates.sort((a, b) => a - b);

    // Calculate average days between occurrences
    let totalDays = 0;
    for (let i = 1; i < dates.length; i++) {
      const diffTime = Math.abs(dates[i] - dates[i - 1]);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      totalDays += diffDays;
    }

    const avgDays = totalDays / (dates.length - 1);

    // Determine frequency based on average days
    if (avgDays < 15) return 'Weekly';
    if (avgDays < 45) return 'Monthly';
    if (avgDays < 100) return 'Quarterly';
    return 'Yearly';
  };

  return (
    <Card variant="outlined" sx={{ m: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <RepeatIcon sx={{ mr: 1 }} />
          Recurring Expenses
        </Typography>

        {recurringItems.length > 0 ? (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Expense</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="center">Frequency</TableCell>
                  <TableCell align="right">Last Paid</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recurringItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell align="right">${item.amount.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={item.frequency}
                        size="small"
                        color={
                          item.frequency === 'Weekly' ? 'error' :
                          item.frequency === 'Monthly' ? 'primary' :
                          item.frequency === 'Quarterly' ? 'success' : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      {item.lastDate.toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No recurring expenses detected yet
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

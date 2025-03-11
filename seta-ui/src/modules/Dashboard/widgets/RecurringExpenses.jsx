import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Box } from '@mui/material';
import RepeatIcon from '@mui/icons-material/Repeat';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export default function RecurringExpenses({ expenses }) {
  const [recurringItems, setRecurringItems] = useState([]);
  const [showFullList, setShowFullList] = useState(false);
  const widgetRef = useRef(null); // Create a ref to reference the widget container

  useEffect(() => {
    if (expenses && expenses.length > 0) {
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
            lastDate: new Date(mostRecent.date),
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

  // Toggle full list visibility and maintain scroll position
  const handleToggleFullList = () => {
    const isExpanding = !showFullList; // Check if we're expanding or collapsing
    setShowFullList(!showFullList); // Toggle the state

    // If collapsing (going back to 5 rows), maintain the scroll position
    if (isExpanding === false) {
      // Use setTimeout to ensure the DOM updates before adjusting the scroll
      setTimeout(() => {
        if (widgetRef.current) {
          widgetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 0);
    }
  };

  // Determine the number of items to display
  const displayedItems = showFullList ? recurringItems : recurringItems.slice(0, 5);

  return (
    <Card variant="outlined" sx={{ m: 2 }} ref={widgetRef}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <RepeatIcon sx={{ mr: 1 }} />
          Recurring Expenses
        </Typography>

        {recurringItems.length > 0 ? (
          <>
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
                  {displayedItems.map((item, index) => (
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
            {recurringItems.length > 5 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <IconButton
                  onClick={handleToggleFullList}
                  color="primary"
                  aria-label={showFullList ? 'Collapse list' : 'Expand list'}
                >
                  {showFullList ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
            )}
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No recurring expenses detected yet
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Box } from '@mui/material';
import RepeatIcon from '@mui/icons-material/Repeat';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import T from '../../../utils/T';

export default function RecurringExpenses({ expenses }) {
  const [recurringItems, setRecurringItems] = useState([]);
  const [showFullList, setShowFullList] = useState(false);
  const widgetRef = useRef(null);

  useEffect(() => {
    if (expenses && expenses.length > 0) {
      const expenseGroups = expenses.reduce((acc, expense) => {
        const key = `${expense.category_name}-${expense.description}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(expense);
        return acc;
      }, {});

      const recurring = Object.entries(expenseGroups)
        .filter(([_, group]) => group.length > 1)
        .map(([_, group]) => {
          const totalAmount = group.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
          const avgAmount = totalAmount / group.length;
          const mostRecent = group.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
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

  const determineFrequency = (dates) => {
    if (dates.length < 2) return 'Unknown';
    dates.sort((a, b) => a - b);
    let totalDays = 0;
    for (let i = 1; i < dates.length; i++) {
      const diffTime = Math.abs(dates[i] - dates[i - 1]);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      totalDays += diffDays;
    }
    const avgDays = totalDays / (dates.length - 1);
    if (avgDays < 15) return 'Weekly';
    if (avgDays < 45) return 'Monthly';
    if (avgDays < 100) return 'Quarterly';
    return 'Yearly';
  };

  const handleToggleFullList = () => {
    const isExpanding = !showFullList;
    setShowFullList(!showFullList);
    if (!isExpanding) {
      setTimeout(() => {
        if (widgetRef.current) {
          widgetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 0);
    }
  };

  const displayedItems = showFullList ? recurringItems : recurringItems.slice(0, 5);

  return (
    <Card variant="outlined" sx={{ m: 2 }} ref={widgetRef}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <RepeatIcon sx={{ mr: 1 }} />
          <T>dashboard.recurringExpenses.title</T>
        </Typography>

        {recurringItems.length > 0 ? (
          <>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><T>dashboard.recurringExpenses.expense</T></TableCell>
                    <TableCell><T>dashboard.expenseBreakdown.categories</T></TableCell>
                    <TableCell align="right"><T>dashboard.recentTransactions.amount</T></TableCell>
                    <TableCell align="center"><T>dashboard.recurringExpenses.frequency</T></TableCell>
                    <TableCell align="right"><T>dashboard.recurringExpenses.lastPaid</T></TableCell>
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
                          label={<T>{`dashboard.recurringExpenses.frequency${item.frequency}`}</T>}
                          size="small"
                          color={
                            item.frequency === 'Weekly' ? 'error' :
                            item.frequency === 'Monthly' ? 'primary' :
                            item.frequency === 'Quarterly' ? 'success' : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell align="right">{item.lastDate.toLocaleDateString()}</TableCell>
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
            <T>dashboard.recurringExpenses.noRecurringExpenses</T>
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

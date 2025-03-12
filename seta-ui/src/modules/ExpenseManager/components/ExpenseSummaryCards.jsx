import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { Assessment as AssessmentIcon, ListAlt as ListAltIcon } from '@mui/icons-material';
import T from '../../../utils/T';

export default function ExpenseSummaryCards({ expenses }) {
  const calculateTotalExpenses = () => {
    return expenses
      .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0)
      .toFixed(2);
  };

  return (
    <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Card sx={{ flexGrow: 1, minWidth: 240 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
          <AssessmentIcon fontSize="large" sx={{ mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="body2" color="text.secondary"><T>expenseManager.totalExpenses</T></Typography>
            <Typography variant="h5" component="div" fontWeight="bold">${calculateTotalExpenses()}</Typography>
          </Box>
        </CardContent>
      </Card>
      <Card sx={{ flexGrow: 1, minWidth: 240 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
          <ListAltIcon fontSize="large" sx={{ mr: 2, color: 'info.main' }} />
          <Box>
            <Typography variant="body2" color="text.secondary"><T>expenseManager.totalEntries</T></Typography>
            <Typography variant="h5" component="div" fontWeight="bold">{expenses.length}</Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

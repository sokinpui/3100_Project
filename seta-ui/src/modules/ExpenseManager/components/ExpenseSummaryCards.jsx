import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import {
  Assessment as AssessmentIcon,
  ListAlt as ListAltIcon
} from '@mui/icons-material';

export default function ExpenseSummaryCards({ expenses }) {
  const calculateTotalExpenses = () => {
    return expenses
      .reduce((sum, expense) => {
        const amount = parseFloat(expense.amount) || 0;
        return sum + amount;
      }, 0) // Add initial value here
      .toFixed(2);
  };

  return (
    <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {/* Total Expenses Card */}
      <Card sx={{ flexGrow: 1, minWidth: 240 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
          <AssessmentIcon fontSize="large" sx={{ mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Expenses
            </Typography>
            <Typography variant="h5" component="div" fontWeight="bold">
              ${calculateTotalExpenses()}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Total Entries Card */}
      <Card sx={{ flexGrow: 1, minWidth: 240 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
          <ListAltIcon fontSize="large" sx={{ mr: 2, color: 'info.main' }} />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Entries
            </Typography>
            <Typography variant="h5" component="div" fontWeight="bold">
              {expenses.length}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

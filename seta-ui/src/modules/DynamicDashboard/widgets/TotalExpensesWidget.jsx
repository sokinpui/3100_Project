import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment'; // Or another relevant icon
import T from '../../../utils/T'; // Your translation component

export default function TotalExpensesWidget({ expenses, isLoading }) {
  const total = expenses
    .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0)
    .toFixed(2);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      {isLoading ? (
        <CircularProgress size={40} />
      ) : (
        <Box sx={{ textAlign: 'center' }}>
          <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <T>dynamicDashboard.totalExpenses</T>
          </Typography>
          <Typography variant="h4" component="div" fontWeight="bold">
            ${total}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

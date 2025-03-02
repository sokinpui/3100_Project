import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

export default function ExpenseBreakdown() {
  return (
    <Card variant="outlined" sx={{ m: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div">
          Expense Breakdown
        </Typography>
        <Typography variant="body2" color="text.secondary">
          [Placeholder for Pie Chart of Expense Categories]
        </Typography>
        <Typography variant="body2" color="text.secondary">
          [Placeholder for Top Expenses Table]
        </Typography>
      </CardContent>
    </Card>
  );
}

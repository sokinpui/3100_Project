import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

export default function BudgetAlertsGoals() {
  return (
    <Card variant="outlined" sx={{ m: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div">
          Budget Alerts & Goals
        </Typography>
        <Typography variant="body2" color="text.secondary">
          [Placeholder for Budget Alerts]
        </Typography>
        <Typography variant="body2" color="text.secondary">
          [Placeholder for Savings Goal Progress]
        </Typography>
      </CardContent>
    </Card>
  );
}

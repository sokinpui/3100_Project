import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

export default function OverviewSummary() {
  return (
    <Card variant="outlined" sx={{ m: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div">
          Overview Summary
        </Typography>
        <Typography variant="body2" color="text.secondary">
          [Placeholder for Total Income]
        </Typography>
        <Typography variant="body2" color="text.secondary">
          [Placeholder for Total Expenses]
        </Typography>
        <Typography variant="body2" color="text.secondary">
          [Placeholder for Net Balance]
        </Typography>
        <Typography variant="body2" color="text.secondary">
          [Placeholder for Savings Progress]
        </Typography>
      </CardContent>
    </Card>
  );
}

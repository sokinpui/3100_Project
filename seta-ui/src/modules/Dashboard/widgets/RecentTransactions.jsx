import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

export default function RecentTransactions() {
  return (
    <Card variant="outlined" sx={{ m: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div">
          Recent Transactions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          [Placeholder for List of Recent Transactions]
        </Typography>
      </CardContent>
    </Card>
  );
}

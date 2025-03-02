import React from 'react';
import { Card, CardContent, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export default function QuickActions() {
  return (
    <Card variant="outlined" sx={{ m: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div">
          Quick Actions
        </Typography>
        <Button variant="contained" color="primary" component={Link} to="/add-expense" sx={{ mr: 1 }}>
          [Add New Expense]
        </Button>
        <Button variant="outlined" color="primary" component={Link} to="/reports">
          [Generate Report]
        </Button>
      </CardContent>
    </Card>
  );
}

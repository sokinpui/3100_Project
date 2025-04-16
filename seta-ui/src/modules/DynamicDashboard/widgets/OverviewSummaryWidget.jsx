import React from 'react';
import { Box, Typography, CircularProgress, Grid, Paper } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ListAltIcon from '@mui/icons-material/ListAlt';
import T from '../../../utils/T';

export default function OverviewSummaryWidget({ expenses, isLoading }) {
  const totalAmount = expenses
    .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0)
    .toFixed(2);
  const totalEntries = expenses.length;

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
  }

  return (
    <Grid container spacing={2} sx={{ height: '100%', alignItems: 'center', p: 1 }}>
      <Grid item xs={6}>
        <Paper elevation={0} sx={{ textAlign: 'center', p: 2, bgcolor: 'transparent' }}>
          <AssessmentIcon sx={{ fontSize: 30, color: 'primary.main', mb: 0.5 }} />
          <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
            <T>dynamicDashboard.totalExpenses</T>
          </Typography>
          <Typography variant="h6" component="div" fontWeight="bold">
            ${totalAmount}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={6}>
        <Paper elevation={0} sx={{ textAlign: 'center', p: 2, bgcolor: 'transparent' }}>
          <ListAltIcon sx={{ fontSize: 30, color: 'info.main', mb: 0.5 }} />
          <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
            <T>dynamicDashboard.totalEntries</T>
          </Typography>
          <Typography variant="h6" component="div" fontWeight="bold">
            {totalEntries}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}

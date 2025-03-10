import React from 'react';
import { Card, CardContent, Typography, Grid, Box, LinearProgress } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SavingsIcon from '@mui/icons-material/Savings';

export default function OverviewSummary({ totalExpenses }) {
  // Sample data - in a real application, you would fetch this from your API
  const totalIncome = 5000; // Placeholder
  const netBalance = totalIncome - totalExpenses;
  const savingsGoal = 1000;
  const currentSavings = netBalance > 0 ? netBalance : 0;
  const savingsProgress = (currentSavings / savingsGoal) * 100;

  return (
    <Card variant="outlined" sx={{ m: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          Overview Summary
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUpIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="subtitle1">Total Income</Typography>
            </Box>
            <Typography variant="h5" color="text.primary">
              ${totalIncome.toFixed(2)}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingDownIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="subtitle1">Total Expenses</Typography>
            </Box>
            <Typography variant="h5" color="error">
              ${totalExpenses.toFixed(2)}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccountBalanceWalletIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1">Net Balance</Typography>
            </Box>
            <Typography
              variant="h5"
              color={netBalance >= 0 ? "success.main" : "error.main"}
            >
              ${netBalance.toFixed(2)}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <SavingsIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1">Savings Progress</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={savingsProgress > 100 ? 100 : savingsProgress}
                  color="success"
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(savingsProgress)}%
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" display="block">
              ${currentSavings.toFixed(2)} / ${savingsGoal.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

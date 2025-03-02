import React from 'react';
import { Grid, Typography } from '@mui/material';
import OverviewSummary from './widgets/OverviewSummary';
import ExpenseBreakdown from './widgets/ExpenseBreakdown';
import RecentTransactions from './widgets/RecentTransactions';
import BudgetAlertsGoals from './widgets/BudgetAlertsGoals';
import QuickActions from './widgets/QuickActions';
import TimePeriodSelector from './widgets/TimePeriodSelector';
import '../../assets/styles/dashboard.css'; // Import the CSS file

export default function Dashboard() {
  return (
    <div className="dashboard">
      <Typography variant="h4" component="h2" gutterBottom>
        Dashboard
      </Typography>
      <TimePeriodSelector />
      <Grid container spacing={2} direction="column">
        <Grid item xs={12}>
          <OverviewSummary />
        </Grid>
        <Grid item xs={12}>
          <ExpenseBreakdown />
        </Grid>
        <Grid item xs={12}>
          <RecentTransactions />
        </Grid>
        <Grid item xs={12}>
          <BudgetAlertsGoals />
        </Grid>
        <Grid item xs={12}>
          <QuickActions />
        </Grid>
      </Grid>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Grid, Typography, CircularProgress } from '@mui/material';
import OverviewSummary from './widgets/OverviewSummary';
import ExpenseBreakdown from './widgets/ExpenseBreakdown';
import RecentTransactions from './widgets/RecentTransactions';
import BudgetAlertsGoals from './widgets/BudgetAlertsGoals';
import QuickActions from './widgets/QuickActions';
import TimePeriodSelector from './widgets/TimePeriodSelector';
import { getUserExpenses, getTotalExpenses } from '../../services/apiService';
import '../../assets/styles/dashboard.css';

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('month');
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('userId') || 1; // Default to 1 for testing

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const expensesData = await getUserExpenses(userId);
        const total = await getTotalExpenses(userId);

        // Filter expenses based on selected time period
        const filteredExpenses = filterExpensesByTimePeriod(expensesData, timePeriod);

        setExpenses(filteredExpenses);
        setTotalExpense(total);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, timePeriod]);

  const filterExpensesByTimePeriod = (expenses, period) => {
    const now = new Date();
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);

      switch(period) {
        case 'week':
          // Last 7 days
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          return expenseDate >= weekAgo;

        case 'month':
          // Current month
          return (
            expenseDate.getMonth() === now.getMonth() &&
            expenseDate.getFullYear() === now.getFullYear()
          );

        case 'quarter':
          // Current quarter
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const expenseQuarter = Math.floor(expenseDate.getMonth() / 3);
          return (
            expenseQuarter === currentQuarter &&
            expenseDate.getFullYear() === now.getFullYear()
          );

        default:
          return true; // Return all expenses if period is not recognized
      }
    });

    return filteredExpenses;
  };

  const handleTimePeriodChange = (period) => {
    setTimePeriod(period);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <CircularProgress />
        <Typography variant="h6">Loading dashboard data...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <Typography variant="h6" color="error">{error}</Typography>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Typography variant="h4" component="h2" gutterBottom>
        Dashboard
      </Typography>
      <TimePeriodSelector
        selectedPeriod={timePeriod}
        onChange={handleTimePeriodChange}
      />
      <Grid container spacing={2} direction="column">
        <Grid item xs={12}>
          <OverviewSummary
            totalExpenses={totalExpense}
          />
        </Grid>
        <Grid item xs={12}>
          <ExpenseBreakdown
            expenses={expenses}
          />
        </Grid>
        <Grid item xs={12}>
          <RecentTransactions
            transactions={expenses.slice(0, 5)}
          />
        </Grid>
        <Grid item xs={12}>
          <BudgetAlertsGoals
            expenses={expenses}
          />
        </Grid>
        <Grid item xs={12}>
          <QuickActions />
        </Grid>
      </Grid>
    </div>
  );
}

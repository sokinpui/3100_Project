import React, { useState, useEffect } from 'react';
import { Grid, Typography, CircularProgress } from '@mui/material';
import OverviewSummary from './widgets/OverviewSummary';
import ExpenseBreakdown from './widgets/ExpenseBreakdown';
import RecentTransactions from './widgets/RecentTransactions';
import BudgetAlertsGoals from './widgets/BudgetAlertsGoals';
import QuickActions from './widgets/QuickActions';
import TimePeriodSelector from './widgets/TimePeriodSelector';
import ExpenseTrendAnalytics from './widgets/ExpenseTrendAnalytics';
import RecurringExpenses from './widgets/RecurringExpenses';
import MonthlyComparison from './widgets/MonthlyComparison';
import SpendingForecast from './widgets/SpendingForecast';
import { getUserExpenses, getTotalExpenses } from '../../services/apiService';
import '../../assets/styles/dashboard.css';

import T from '../../utils/T';

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('month');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [customRange, setCustomRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('userId') || 1; // Default to 1 for testing

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const expensesData = await getUserExpenses(userId);
        const total = await getTotalExpenses(userId);

        // Filter expenses based on selected time period
        const filteredExpenses = filterExpensesByTimePeriod(expensesData, timePeriod, customRange);

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
  }, [userId, timePeriod, customRange]);

  const filterExpensesByTimePeriod = (expenses, period, customRange) => {
    const now = new Date();
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);

      switch (period) {
        case 'week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - 6);
          return expenseDate >= weekStart && expenseDate <= now;

        case 'month':
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          return expenseDate >= monthStart && expenseDate <= monthEnd;

        case 'quarter':
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const quarterStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
          const quarterEnd = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
          return expenseDate >= quarterStart && expenseDate <= quarterEnd;

        case 'year':
          const yearStart = new Date(now.getFullYear(), 0, 1);
          const yearEnd = new Date(now.getFullYear(), 11, 31);
          return expenseDate >= yearStart && expenseDate <= yearEnd;

        case 'custom':
          if (customRange.startDate && customRange.endDate) {
            return expenseDate >= customRange.startDate && expenseDate <= customRange.endDate;
          }
          return true;

        default:
          return true;
      }
    });

    return filteredExpenses;
  };

  const handlePeriodChange = (periodData) => {
    if (typeof periodData === 'string') {
      setSelectedPeriod(periodData);
      setTimePeriod(periodData);
      setCustomRange({ startDate: null, endDate: null });
    } else if (periodData.period === 'custom') {
      setSelectedPeriod('custom');
      setTimePeriod('custom');
      setCustomRange({
        startDate: periodData.startDate,
        endDate: periodData.endDate,
      });
    }
  };

    if (loading) {
    return (
      <div className="dashboard-loading">
        <CircularProgress />
        <Typography variant="h6"><T>dashboard.loading</T></Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <Typography variant="h6" color="error"><T>dashboard.error</T></Typography>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <TimePeriodSelector
        selectedPeriod={timePeriod}
        onChange={handlePeriodChange}
        customRange={customRange}
      />
      <Grid container spacing={2} direction="column">
        <Grid item xs={12}>
          <OverviewSummary totalExpenses={totalExpense} />
        </Grid>
        <Grid item xs={12}>
          <ExpenseBreakdown expenses={expenses} />
        </Grid>
        <Grid item xs={12}>
          <RecentTransactions transactions={expenses.slice(0, 5)} />
        </Grid>
        <Grid item xs={12}>
          <ExpenseTrendAnalytics expenses={expenses} />
        </Grid>
        <Grid item xs={12}>
          <SpendingForecast expenses={expenses} />
        </Grid>
        <Grid item xs={12}>
          <RecurringExpenses expenses={expenses} />
        </Grid>
        <Grid item xs={12}>
          <MonthlyComparison expenses={expenses} />
        </Grid>
        <Grid item xs={12}>
          <BudgetAlertsGoals expenses={expenses} />
        </Grid>
        <Grid item xs={12}>
          <QuickActions />
        </Grid>
      </Grid>
    </div>
  );
}

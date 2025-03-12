import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Alert, Box, LinearProgress, Paper, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next'; // Import useTranslation for t function
import T from '../../../utils/T';

export default function BudgetAlertsGoals({ expenses }) {
  const { t } = useTranslation(); // Get the t function for translation
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);

  useEffect(() => {
    const budgets = [
      { category: 'Food', limit: 500, spent: 0 },
      { category: 'Transportation', limit: 300, spent: 0 },
      { category: 'Shopping', limit: 200, spent: 0 }
    ];

    const goals = [
      { name: 'Emergency Fund', target: 3000, current: 1500 },
      { name: 'Vacation', target: 1200, current: 400 }
    ];

    if (expenses && expenses.length > 0) {
      expenses.forEach(expense => {
        const budgetCategory = budgets.find(b => b.category === expense.category_name);
        if (budgetCategory) {
          budgetCategory.spent += parseFloat(expense.amount);
        }
      });
    }

    const alerts = budgets
      .filter(budget => budget.spent > budget.limit * 0.8)
      .map(budget => ({
        category: budget.category,
        spent: budget.spent,
        limit: budget.limit,
        severity: budget.spent > budget.limit ? 'error' : 'warning',
        message: budget.spent > budget.limit
          ? t('dashboard.budgetAlertsGoals.exceededBudget', {
              category: budget.category,
              amount: (budget.spent - budget.limit).toFixed(2)
            })
          : t('dashboard.budgetAlertsGoals.closeToBudget', {
              category: budget.category,
              spent: budget.spent.toFixed(2),
              limit: budget.limit
            })
      }));

    setBudgetAlerts(alerts);
    setSavingsGoals(goals);
  }, [expenses, t]); // Add t to dependency array

  return (
    <Card variant="outlined" sx={{ m: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          <T>dashboard.budgetAlertsGoals.title</T>
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            <T>dashboard.budgetAlertsGoals.alerts</T>
          </Typography>
          {budgetAlerts.length > 0 ? (
            budgetAlerts.map((alert, index) => (
              <Alert severity={alert.severity} key={index} sx={{ mb: 1 }}>
                {alert.message}
              </Alert>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              <T>dashboard.budgetAlertsGoals.noAlerts</T>
            </Typography>
          )}
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            <T>dashboard.budgetAlertsGoals.savingsGoalProgress</T>
          </Typography>
          <Grid container spacing={2}>
            {savingsGoals.map((goal, index) => {
              const progress = (goal.current / goal.target) * 100;
              return (
                <Grid item xs={12} md={6} key={index}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="primary">
                      {goal.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 1 }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          color={progress > 75 ? "success" : "primary"}
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {Math.round(progress)}%
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" display="block">
                      ${goal.current.toFixed(2)} / ${goal.target.toFixed(2)}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
}

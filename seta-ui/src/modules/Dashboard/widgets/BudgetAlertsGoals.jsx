import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Alert, Box, LinearProgress, Paper, Grid } from '@mui/material';

export default function BudgetAlertsGoals({ expenses }) {
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);

  useEffect(() => {
    // Sample budget categories with limits
    // In a real app, these would come from user settings in the database
    const budgets = [
      { category: 'Food', limit: 500, spent: 0 },
      { category: 'Transportation', limit: 300, spent: 0 },
      { category: 'Shopping', limit: 200, spent: 0 }
    ];

    // Sample savings goals
    // Again, these would come from user settings
    const goals = [
      { name: 'Emergency Fund', target: 3000, current: 1500 },
      { name: 'Vacation', target: 1200, current: 400 }
    ];

    if (expenses && expenses.length > 0) {
      // Calculate spending per category
      expenses.forEach(expense => {
        const budgetCategory = budgets.find(b => b.category === expense.category_name);
        if (budgetCategory) {
          budgetCategory.spent += parseFloat(expense.amount);
        }
      });
    }

    // Generate alerts for categories approaching or exceeding budget
    const alerts = budgets
      .filter(budget => budget.spent > budget.limit * 0.8) // 80% of budget
      .map(budget => ({
        category: budget.category,
        spent: budget.spent,
        limit: budget.limit,
        severity: budget.spent > budget.limit ? 'error' : 'warning',
        message: budget.spent > budget.limit
          ? `You've exceeded your ${budget.category} budget by $${(budget.spent - budget.limit).toFixed(2)}`
          : `You're close to your ${budget.category} budget limit ($${budget.spent.toFixed(2)}/$${budget.limit})`
      }));

    setBudgetAlerts(alerts);
    setSavingsGoals(goals);
  }, [expenses]);

  return (
    <Card variant="outlined" sx={{ m: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          Budget Alerts & Goals
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Budget Alerts
          </Typography>
          {budgetAlerts.length > 0 ? (
            budgetAlerts.map((alert, index) => (
              <Alert severity={alert.severity} key={index} sx={{ mb: 1 }}>
                {alert.message}
              </Alert>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              You're doing great! All your spending is within budget.
            </Typography>
          )}
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Savings Goal Progress
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
                      ${goal.current.toFixed(2)} of ${goal.target.toFixed(2)}
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

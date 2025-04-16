// src/modules/DynamicDashboard/widgets/SpendingGoalTrackerWidget.jsx
import React, { useState } from 'react';
import { Box, Typography, LinearProgress, TextField, Button, Grid, Paper } from '@mui/material';
import TrackChangesIcon from '@mui/icons-material/TrackChanges'; // Example Icon
import T from '../../../utils/T';

// Basic Example: Tracks a single, manually entered goal vs total expenses
// In a real app, this would fetch goal data from the backend
export default function SpendingGoalTrackerWidget({ expenses, isLoading }) {
  const [goalAmount, setGoalAmount] = useState(1000); // Example goal, load from state/backend later
  const [tempGoal, setTempGoal] = useState(goalAmount.toString());

  const totalSpent = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  const progress = goalAmount > 0 ? Math.min((totalSpent / goalAmount) * 100, 100) : 0; // Cap at 100%
  const remaining = Math.max(0, goalAmount - totalSpent); // Don't show negative remaining

  const handleGoalChange = (event) => {
    setTempGoal(event.target.value);
  };

  const handleSetGoal = () => {
      const newGoal = parseFloat(tempGoal);
      if (!isNaN(newGoal) && newGoal >= 0) {
          setGoalAmount(newGoal);
          // Here you would also ideally save the goal to backend/localStorage
      } else {
          setTempGoal(goalAmount.toString()); // Reset if invalid input
      }
  };

  // Simple color logic for progress bar
  const getProgressColor = () => {
      if (progress > 90) return 'error';
      if (progress > 70) return 'warning';
      return 'primary';
  }

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <TrackChangesIcon color="primary" sx={{ mr: 1 }}/>
          <Typography variant="subtitle1" fontWeight="medium">
             <T>dynamicDashboard.spendingGoal</T> (Manual)
          </Typography>
        </Box>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          ${totalSpent.toFixed(2)} <Typography variant="caption" color="text.secondary"> / ${goalAmount.toFixed(2)} </Typography>
        </Typography>
        <LinearProgress
            variant="determinate"
            value={progress}
            color={getProgressColor()}
            sx={{ height: 8, borderRadius: 4, mb: 1 }}
        />
        <Typography variant="body2" color="text.secondary">
            { goalAmount > totalSpent
                ? `$${remaining.toFixed(2)} `
                : `$${Math.abs(remaining).toFixed(2)} `
            }
            { goalAmount > totalSpent
                ? <T>dynamicDashboard.remaining</T>
                : <T>dynamicDashboard.overBudget</T>
            }
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 1.5, mt: 2 }}>
        <Typography variant="caption" display="block" gutterBottom><T>dynamicDashboard.setSpendingGoal</T></Typography>
        <Grid container spacing={1} alignItems="center">
            <Grid item xs>
                <TextField
                label={T('dynamicDashboard.goalAmount')}
                value={tempGoal}
                onChange={handleGoalChange}
                size="small"
                type="number"
                fullWidth
                InputProps={{ startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography> }}
                />
            </Grid>
            <Grid item>
                <Button variant="contained" size="small" onClick={handleSetGoal}>
                    <T>dynamicDashboard.setGoal</T>
                </Button>
            </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

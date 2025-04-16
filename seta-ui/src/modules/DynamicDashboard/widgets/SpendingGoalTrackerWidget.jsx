// src/modules/DynamicDashboard/widgets/SpendingGoalTrackerWidget.jsx
import React, { useState, useEffect } from 'react'; // Added useEffect
import { Box, Typography, LinearProgress, TextField, Button, Grid, Paper } from '@mui/material';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import T from '../../../utils/T';

const GOAL_STORAGE_KEY = 'spendingGoalTrackerAmount_v1'; // localStorage key

export default function SpendingGoalTrackerWidget({ expenses, isLoading }) {
  const { t } = useTranslation(); // Get t function

  // --- Initialize state from localStorage ---
  const [goalAmount, setGoalAmount] = useState(() => {
      const savedGoal = localStorage.getItem(GOAL_STORAGE_KEY);
      const parsedGoal = parseFloat(savedGoal);
      return !isNaN(parsedGoal) && parsedGoal >= 0 ? parsedGoal : 1000; // Default 1000
  });
  // --- End Initialization ---

  const [tempGoal, setTempGoal] = useState(goalAmount.toString());

  // Update tempGoal if goalAmount changes (e.g., loaded from storage after initial render)
  useEffect(() => {
      setTempGoal(goalAmount.toString());
  }, [goalAmount]);

  const totalSpent = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  const progress = goalAmount > 0 ? Math.min((totalSpent / goalAmount) * 100, 100) : 0;
  const remaining = Math.max(0, goalAmount - totalSpent);

  const handleGoalChange = (event) => {
    setTempGoal(event.target.value);
  };

  const handleSetGoal = () => {
      const newGoal = parseFloat(tempGoal);
      if (!isNaN(newGoal) && newGoal >= 0) {
          setGoalAmount(newGoal);
          // --- Save to localStorage ---
          localStorage.setItem(GOAL_STORAGE_KEY, newGoal.toString());
          // --- End Save ---
      } else {
          // Reset temp input to current valid goal if input is invalid
          setTempGoal(goalAmount.toString());
      }
  };

  const getProgressColor = () => {
      if (progress >= 100) return 'error'; // Show error if goal met or exceeded
      if (progress > 75) return 'warning';
      return 'primary';
  }

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <TrackChangesIcon color="primary" sx={{ mr: 1 }}/>
          <Typography variant="subtitle1" fontWeight="medium">
             <T>dynamicDashboard.spendingGoal</T>
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
            { goalAmount >= totalSpent // Check if goal is met or not exceeded
                ? `$${remaining.toFixed(2)} `
                : `$${Math.abs(goalAmount - totalSpent).toFixed(2)} ` // Calculate overspent amount
            }
            { goalAmount >= totalSpent
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
                    // Use t() for the label directly
                    label={t('dynamicDashboard.goalAmount')}
                    value={tempGoal}
                    onChange={handleGoalChange}
                    size="small"
                    type="number"
                    fullWidth
                    InputProps={{
                        startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>,
                        inputProps: { min: 0 } // Prevent negative numbers
                    }}
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

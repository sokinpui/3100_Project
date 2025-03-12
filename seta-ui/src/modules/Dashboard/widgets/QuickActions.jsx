import React from 'react';
import { Card, CardContent, Button, Typography, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import PieChartIcon from '@mui/icons-material/PieChart';
import T from '../../../utils/T'; // Import the T component

export default function QuickActions() {
  return (
    <Card variant="outlined" sx={{ m: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          <T>dashboard.quickActions.title</T>
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/manage-expenses"
              startIcon={<AddIcon />}
            >
              <T>dashboard.quickActions.addExpense</T>
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="primary"
              component={Link}
              to="/reports"
              startIcon={<AssessmentIcon />}
            >
              <T>expenseReports.downloadButton</T>
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="secondary"
              component={Link}
              to="/settings"
              startIcon={<SettingsIcon />}
            >
              <T>sidebar.settings</T>
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              component={Link}
              to="/analytics"
              startIcon={<PieChartIcon />}
            >
              <T>dashboard.expenseTrendAnalytics.title</T>
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

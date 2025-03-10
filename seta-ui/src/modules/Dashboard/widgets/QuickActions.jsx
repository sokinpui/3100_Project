import React from 'react';
import { Card, CardContent, Button, Typography, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import PieChartIcon from '@mui/icons-material/PieChart';

export default function QuickActions() {
  return (
    <Card variant="outlined" sx={{ m: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/add-expense"
              startIcon={<AddIcon />}
            >
              Add Expense
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
              Generate Report
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
              Settings
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              component={Link}
              to="/analytics"
              startIcon={<PieChartIcon />}
            >
              Analytics
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

// modules/Dashboard/widgets/TimePeriodSelector.jsx
import React from 'react';
import { Card, CardContent, Typography, Select, MenuItem, Box } from '@mui/material';

export default function TimePeriodSelector({ selectedPeriod, onChange }) {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  // Function to calculate the time range based on the selected period
  const getTimeRange = (period) => {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'week':
        // Last 7 days (including today)
        endDate = new Date(now);
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6); // 7 days total, including today
        break;

      case 'month':
        // Current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1); // First day of the month
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of the month
        break;

      case 'quarter':
        // Current quarter
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1); // First day of quarter
        endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0); // Last day of quarter
        break;

      case 'year':
        // Current year
        startDate = new Date(now.getFullYear(), 0, 1); // Jan 1st
        endDate = new Date(now.getFullYear(), 11, 31); // Dec 31st
        break;

      case 'custom':
        // Placeholder for custom (to be implemented later)
        return 'Custom: Select a range';
      default:
        return 'Select a time period';
    }

    // Format dates (e.g., "Mar 5, 2025 - Mar 11, 2025")
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
  };

  return (
    <Card variant="outlined" sx={{ m: 2, mb: 4 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" component="div" gutterBottom>
              Time Period
            </Typography>
            <Select
              value={selectedPeriod}
              onChange={handleChange}
              displayEmpty
            >
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </Select>
          </Box>
             <Box sx={{ flexGrow: 1, ml: 2}}>
            <Typography
              variant="body1"
              color="textSecondary"
              fontWeight="bold"
              sx={{ textAlign: "center", fontSize: "1.5rem" }}
            >
              {getTimeRange(selectedPeriod)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

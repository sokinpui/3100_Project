import React from 'react';
import { Card, CardContent, Typography, Select, MenuItem, Button } from '@mui/material';

export default function TimePeriodSelector({ selectedPeriod, onChange }) {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <Card variant="outlined" sx={{ m: 2, mb: 4 }}>
      <CardContent>
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
          <MenuItem value="custom">Custom</MenuItem>
        </Select>
        <Button variant="contained" color="primary" sx={{ ml: 2 }}>
          Apply
        </Button>
      </CardContent>
    </Card>
  );
}

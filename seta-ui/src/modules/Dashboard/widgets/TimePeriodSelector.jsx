import React from 'react';
import { Card, CardContent, Typography, Select, MenuItem, Button } from '@mui/material';

export default function TimePeriodSelector() {
  return (
    <Card variant="outlined" sx={{ m: 2, mb: 4 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          Time Period
        </Typography>
        <Select value="" displayEmpty>
          <MenuItem value="" disabled>
            [Select Period]
          </MenuItem>
          <MenuItem value="week">[Week]</MenuItem>
          <MenuItem value="month">[Month]</MenuItem>
          <MenuItem value="quarter">[Quarter]</MenuItem>
          <MenuItem value="custom">[Custom]</MenuItem>
        </Select>
        <Button variant="contained" color="primary" sx={{ ml: 2 }}>
          [Apply]
        </Button>
      </CardContent>
    </Card>
  );
}

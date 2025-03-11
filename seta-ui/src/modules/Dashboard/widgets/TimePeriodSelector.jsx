import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Select, MenuItem, Box } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export default function TimePeriodSelector({ selectedPeriod, onChange, customRange: parentCustomRange }) {
  const [localCustomRange, setLocalCustomRange] = useState({
    startDate: parentCustomRange?.startDate || null,
    endDate: parentCustomRange?.endDate || null,
  });
  const [showCustomPicker, setShowCustomPicker] = useState(selectedPeriod === 'custom');

  // Sync local state with parent customRange prop
  useEffect(() => {
    setLocalCustomRange({
      startDate: parentCustomRange?.startDate || null,
      endDate: parentCustomRange?.endDate || null,
    });
    setShowCustomPicker(selectedPeriod === 'custom');
  }, [parentCustomRange, selectedPeriod]);

  const handlePeriodChange = (event) => {
    const value = event.target.value;
    if (value === 'custom') {
      setShowCustomPicker(true);
      // Reset custom range when switching to custom
      setLocalCustomRange({ startDate: null, endDate: null });
      onChange('custom'); // Notify parent of period change
    } else {
      setShowCustomPicker(false);
      setLocalCustomRange({ startDate: null, endDate: null });
      onChange(value);
    }
  };

  const handleCustomDateChange = (type) => (date) => {
    setLocalCustomRange((prev) => {
      const newRange = { ...prev, [type]: date };
      if (newRange.startDate && newRange.endDate) {
        onChange({
          period: 'custom',
          startDate: newRange.startDate,
          endDate: newRange.endDate,
        });
      }
      return newRange;
    });
  };

  const getTimeRange = () => {
    // Handle custom period explicitly
    if (selectedPeriod === 'custom') {
      if (localCustomRange.startDate && localCustomRange.endDate) {
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return `${localCustomRange.startDate.toLocaleDateString('en-US', options)} - ${localCustomRange.endDate.toLocaleDateString('en-US', options)}`;
      }
      return 'Select custom dates'; // Placeholder when custom dates are not fully selected
    }

    // Handle predefined periods
    const now = new Date();
    let startDate, endDate;

    switch (selectedPeriod) {
      case 'week':
        endDate = new Date(now);
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        return 'Select a time period';
    }

    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card variant="outlined" sx={{ m: 2, mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" component="div" gutterBottom>
                Time Period
              </Typography>
              <Select
                value={selectedPeriod}
                onChange={handlePeriodChange}
                displayEmpty
              >
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="quarter">This Quarter</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
              {showCustomPicker && (
                <Box sx={{ mt: 2 }}>
                  <DatePicker
                    label="Start Date"
                    value={localCustomRange.startDate}
                    onChange={handleCustomDateChange('startDate')}
                    maxDate={localCustomRange.endDate || new Date()}
                    sx={{ mr: 2 }}
                  />
                  <DatePicker
                    label="End Date"
                    value={localCustomRange.endDate}
                    onChange={handleCustomDateChange('endDate')}
                    minDate={localCustomRange.startDate}
                    maxDate={new Date()}
                  />
                </Box>
              )}
            </Box>
            <Box sx={{ flexGrow: 1, ml: 2 }}>
              <Typography
                variant="body1"
                color="textSecondary"
                fontWeight="bold"
                sx={{ textAlign: "center", fontSize: "1.5rem" }}
              >
                {getTimeRange()}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
}

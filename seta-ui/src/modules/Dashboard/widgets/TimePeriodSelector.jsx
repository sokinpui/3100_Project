import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Select, MenuItem, Box } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import T from '../../../utils/T';
import { useLocalizedDateFormat } from '../../../utils/useLocalizedDateFormat';
import { enUS, zhCN } from 'date-fns/locale';

export default function TimePeriodSelector({ selectedPeriod, onChange, customRange: parentCustomRange }) {
  const [localCustomRange, setLocalCustomRange] = useState({
    startDate: parentCustomRange?.startDate || null,
    endDate: parentCustomRange?.endDate || null,
  });
  const [showCustomPicker, setShowCustomPicker] = useState(selectedPeriod === 'custom');

  // Use the localized date formatting hook, now returning an object
  const { format: formatDate } = useLocalizedDateFormat(); // Destructure `format` and rename it to `formatDate`

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
      setLocalCustomRange({ startDate: null, endDate: null });
      onChange('custom');
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
    if (selectedPeriod === 'custom') {
      if (localCustomRange.startDate && localCustomRange.endDate) {
        // Use the localized formatDate function
        const formatStr = formatDate(new Date(), 'MMM d, yyyy') === formatDate(new Date(), 'MMM d, yyyy', { locale: enUS })
          ? 'MMM d, yyyy' // English format
          : 'yyyy年M月d日'; // Chinese format
        return `${formatDate(localCustomRange.startDate, formatStr)} - ${formatDate(localCustomRange.endDate, formatStr)}`;
      }
      return <T>dashboard.timePeriodSelector.selectCustomDates</T>;
    }

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
        return <T>dashboard.timePeriodSelector.selectTimePeriod</T>;
    }

    // Use the localized formatDate function
    const formatStr = formatDate(new Date(), 'MMM d, yyyy') === formatDate(new Date(), 'MMM d, yyyy', { locale: enUS })
      ? 'MMM d, yyyy' // English format
      : 'yyyy年M月d日'; // Chinese format
    return `${formatDate(startDate, formatStr)} - ${formatDate(endDate, formatStr)}`;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card variant="outlined" sx={{ m: 2, mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" component="div" gutterBottom>
                <T>dashboard.timePeriodSelector.title</T>
              </Typography>
              <Select
                value={selectedPeriod}
                onChange={handlePeriodChange}
                displayEmpty
              >
                <MenuItem value="week"><T>dashboard.timePeriodSelector.week</T></MenuItem>
                <MenuItem value="month"><T>dashboard.timePeriodSelector.month</T></MenuItem>
                <MenuItem value="quarter"><T>dashboard.timePeriodSelector.quarter</T></MenuItem>
                <MenuItem value="year"><T>dashboard.timePeriodSelector.year</T></MenuItem>
                <MenuItem value="custom"><T>dashboard.timePeriodSelector.custom</T></MenuItem>
              </Select>
              {showCustomPicker && (
                <Box sx={{ mt: 2 }}>
                  <DatePicker
                    label={<T>dashboard.timePeriodSelector.startDate</T>}
                    value={localCustomRange.startDate}
                    onChange={handleCustomDateChange('startDate')}
                    maxDate={localCustomRange.endDate || new Date()}
                    sx={{ mr: 2 }}
                  />
                  <DatePicker
                    label={<T>dashboard.timePeriodSelector.endDate</T>}
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

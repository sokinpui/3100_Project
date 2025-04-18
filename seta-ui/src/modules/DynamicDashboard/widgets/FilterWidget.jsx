// src/modules/DynamicDashboard/widgets/FilterWidget.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Select, MenuItem, Checkbox, ListItemText,
  OutlinedInput, InputLabel, FormControl, Slider, Chip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import T from '../../../utils/T';
import { expenseCategories } from '../../../constants';

// Debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

const SLIDER_STEP = 50;

export default function FilterWidget({
  onFilterChange,
  currentFilters,
  availableCategories = [],
  maxAmount,
  isLoadingData,
}) {
  const { t } = useTranslation();
  const [tempAmountRange, setTempAmountRange] = useState(currentFilters.amountRange);

  // Sync internal state with props
  useEffect(() => {
    setTempAmountRange(currentFilters.amountRange);
  }, [currentFilters.amountRange]);

  // Adjust amount range if maxAmount changes
  useEffect(() => {
    if (!isLoadingData) {
      const [currentMin, currentMax] = currentFilters.amountRange;
      let newMax = Math.min(currentMax, maxAmount);
      let newMin = Math.min(currentMin, newMax);
      const newRange = [newMin, newMax];
      if (tempAmountRange[0] !== newRange[0] || tempAmountRange[1] !== newRange[1]) {
        setTempAmountRange(newRange);
        // Notify parent only if filters actually changed
        if (
          currentFilters.amountRange[0] !== newRange[0] ||
          currentFilters.amountRange[1] !== newRange[1]
        ) {
          onFilterChange({ ...currentFilters, amountRange: newRange });
        }
      }
    }
  }, [maxAmount, currentFilters, onFilterChange, isLoadingData]);

  // Debounced notify parent
  const debouncedNotifyParent = useCallback(
    debounce((filters) => {
      if (onFilterChange) {
        onFilterChange(filters);
      }
    }, 500),
    [onFilterChange]
  );

  const handleCategoryChange = (event) => {
    const { target: { value } } = event;
    const newCategories = typeof value === 'string' ? value.split(',') : value;
    const newFilters = { ...currentFilters, categories: newCategories };
    onFilterChange(newFilters);
  };

  const handleAmountSliderChange = (event, newValue) => {
    const adjustedValue = [
      Math.min(newValue[0], maxAmount),
      Math.min(newValue[1], maxAmount)
    ];
    if (adjustedValue[0] > adjustedValue[1]) {
      adjustedValue[0] = adjustedValue[1];
    }
    setTempAmountRange(adjustedValue);
    debouncedNotifyParent({ ...currentFilters, amountRange: adjustedValue });
  };

  const handleAmountSliderChangeCommitted = (event, newValue) => {
    const adjustedValue = [
      Math.min(newValue[0], maxAmount),
      Math.min(newValue[1], maxAmount)
    ];
    if (adjustedValue[0] > adjustedValue[1]) {
      adjustedValue[0] = adjustedValue[1];
    }
    onFilterChange({ ...currentFilters, amountRange: adjustedValue });
  };

  // Helper to get display name
  const getDisplayName = (name) => {
    const details = expenseCategories.find(cat => cat.name === name);
    if (details) {
      const key = `expenseManager.category_${details.key}`;
      return t(key, { defaultValue: name });
    }
    return t(`incomeSource.${name}`, { defaultValue: name });
  };

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Category / Source Filter */}
      <FormControl fullWidth size="small" disabled={isLoadingData}>
        <InputLabel id="category-source-multi-select-label">
          <T>dynamicDashboard.filterByCategorySource</T>
        </InputLabel>
        <Select
          labelId="category-source-multi-select-label"
          multiple
          value={currentFilters.categories}
          onChange={handleCategoryChange}
          input={<OutlinedInput label={t('dynamicDashboard.filterByCategorySource')} />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={getDisplayName(value)} size="small" />
              ))}
            </Box>
          )}
          MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
        >
          {availableCategories.map((name) => (
            <MenuItem key={name} value={name}>
              <Checkbox checked={currentFilters.categories.indexOf(name) > -1} size="small" />
              <ListItemText primary={getDisplayName(name)} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Amount Range Filter */}
      <Box>
        <Typography gutterBottom id="amount-range-slider-label">
          <T>dynamicDashboard.filterByAmount</T>: ${tempAmountRange[0]} - ${tempAmountRange[1]}
        </Typography>
        <Slider
          value={tempAmountRange}
          onChange={handleAmountSliderChange}
          onChangeCommitted={handleAmountSliderChangeCommitted}
          valueLabelDisplay="auto"
          min={0}
          max={maxAmount}
          step={SLIDER_STEP}
          getAriaValueText={(value) => `$${value}`}
          aria-labelledby="amount-range-slider-label"
          sx={{ mt: 1 }}
          disabled={isLoadingData}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption">$0</Typography>
          <Typography variant="caption">${maxAmount}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

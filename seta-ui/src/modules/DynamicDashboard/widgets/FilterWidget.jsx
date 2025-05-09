// src/modules/DynamicDashboard/widgets/FilterWidget.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Select, MenuItem, Checkbox, ListItemText,
  OutlinedInput, InputLabel, FormControl, Slider, Chip, FormControlLabel
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
const AUTO_ADJUST_MAX_STORAGE_KEY = 'dynamicDashboardFilterAutoAdjust_v1'; // New localStorage key

export default function FilterWidget({
  onFilterChange,
  currentFilters,
  availableCategories = [],
  maxAmount,
  isLoadingData,
}) {
  const { t } = useTranslation();
  const [tempAmountRange, setTempAmountRange] = useState(currentFilters.amountRange);

  // Initialize autoAdjustMax from localStorage, default to true
  const [autoAdjustMax, setAutoAdjustMax] = useState(() => {
    const savedState = localStorage.getItem(AUTO_ADJUST_MAX_STORAGE_KEY);
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  // Save autoAdjustMax to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(AUTO_ADJUST_MAX_STORAGE_KEY, JSON.stringify(autoAdjustMax));
  }, [autoAdjustMax]);


  // Sync internal tempAmountRange with currentFilters from props
  useEffect(() => {
    if (
      currentFilters.amountRange[0] !== tempAmountRange[0] ||
      currentFilters.amountRange[1] !== tempAmountRange[1]
    ) {
       setTempAmountRange(currentFilters.amountRange);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilters.amountRange]);


  // Effect to handle changes in maxAmount, autoAdjustMax setting, and incoming currentFilters.amountRange
  useEffect(() => {
    if (isLoadingData) return;

    const [propMin, propMax] = currentFilters.amountRange;
    let targetMin = propMin;
    let targetMax = propMax;

    if (autoAdjustMax) {
      targetMax = maxAmount;
      targetMin = Math.min(propMin, targetMax);
    } else {
      if (propMax > maxAmount) {
        targetMax = maxAmount;
      }
      targetMin = Math.min(propMin, targetMax);
    }

    const newRange = [Math.max(0, targetMin), Math.max(0, targetMax)]; // Ensure range values are not negative

    if (tempAmountRange[0] !== newRange[0] || tempAmountRange[1] !== newRange[1]) {
      setTempAmountRange(newRange);
    }

    if (propMin !== newRange[0] || propMax !== newRange[1]) {
      onFilterChange({ ...currentFilters, amountRange: newRange });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxAmount, autoAdjustMax, currentFilters.amountRange, isLoadingData, onFilterChange]);


  const debouncedNotifyParent = useCallback(
    debounce((filtersToApply) => {
      if (onFilterChange) {
        onFilterChange(filtersToApply);
      }
    }, 300),
    [onFilterChange]
  );

  const handleCategoryChange = (event) => {
    const { target: { value } } = event;
    const newCategories = typeof value === 'string' ? value.split(',') : value;
    const newFilters = { ...currentFilters, categories: newCategories };
    onFilterChange(newFilters);
  };

  const handleAmountSliderChange = (event, newValue) => {
    const newSliderValue = [
      Math.min(Math.max(0, newValue[0]), maxAmount),
      Math.min(Math.max(0, newValue[1]), maxAmount)
    ];
    if (newSliderValue[0] > newSliderValue[1]) {
      newSliderValue[0] = newSliderValue[1];
    }

    setTempAmountRange(newSliderValue);
    debouncedNotifyParent({ ...currentFilters, amountRange: newSliderValue });
  };

  const handleAmountSliderChangeCommitted = (event, newValue) => {
    // eslint-disable-next-line no-underscore-dangle
    if (debouncedNotifyParent._timeoutId) clearTimeout(debouncedNotifyParent._timeoutId);


    const finalSliderValue = [
      Math.min(Math.max(0, newValue[0]), maxAmount),
      Math.min(Math.max(0, newValue[1]), maxAmount)
    ];
    if (finalSliderValue[0] > finalSliderValue[1]) {
      finalSliderValue[0] = finalSliderValue[1];
    }

    setTempAmountRange(finalSliderValue);

    onFilterChange({ ...currentFilters, amountRange: finalSliderValue });
  };


  const handleAutoAdjustChange = (event) => {
    setAutoAdjustMax(event.target.checked);
  };

  const getDisplayName = (name) => {
    const details = expenseCategories.find(cat => cat.name === name);
    if (details) {
      const key = `expenseManager.category_${details.key}`;
      return t(key, { defaultValue: name });
    }
    return t(`incomeSource.${name}`, { defaultValue: name });
  };

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
          max={maxAmount > 0 ? maxAmount : 100} // Ensure max is at least a small positive number to prevent slider issues
          step={SLIDER_STEP > 0 ? SLIDER_STEP : 1}
          getAriaValueText={(value) => `$${value}`}
          aria-labelledby="amount-range-slider-label"
          sx={{ mt: 1 }}
          disabled={isLoadingData || maxAmount === 0}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption">$0</Typography>
          <Typography variant="caption">${maxAmount}</Typography>
        </Box>
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            checked={autoAdjustMax}
            onChange={handleAutoAdjustChange}
            size="small"
            disabled={isLoadingData}
          />
        }
        label={<Typography variant="body2"><T>dynamicDashboard.autoAdjustMaxAmount</T></Typography>}
        sx={{ mt: -0.5 }}
      />
    </Box>
  );
}

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
  // Store the timeoutId on the returned function for potential clearing
  const debouncedFunc = (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
  // eslint-disable-next-line no-underscore-dangle
  debouncedFunc._clearTimeout = () => clearTimeout(timeoutId);
  // eslint-disable-next-line no-underscore-dangle
  Object.defineProperty(debouncedFunc, '_timeoutId', {
    get: () => timeoutId,
  });
  return debouncedFunc;
};

const SLIDER_STEP = 50;
const AUTO_ADJUST_MAX_STORAGE_KEY = 'dynamicDashboardFilterAutoAdjust_v1';

export default function FilterWidget({
  onFilterChange,
  currentFilters,
  availableCategories = [],
  maxAmount,
  isLoadingData,
}) {
  const { t } = useTranslation();
  const [tempAmountRange, setTempAmountRange] = useState(currentFilters.amountRange);

  const [autoAdjustMax, setAutoAdjustMax] = useState(() => {
    const savedState = localStorage.getItem(AUTO_ADJUST_MAX_STORAGE_KEY);
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  useEffect(() => {
    localStorage.setItem(AUTO_ADJUST_MAX_STORAGE_KEY, JSON.stringify(autoAdjustMax));
  }, [autoAdjustMax]);

  // Sync internal tempAmountRange with currentFilters.amountRange from props
  // This handles external changes to currentFilters.amountRange
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
      targetMin = Math.min(propMin, targetMax); // Ensure min doesn't exceed new targetMax
    } else {
      // If autoAdjustMax is false, currentFilters.amountRange is the authority,
      // but it must be capped by maxAmount.
      if (propMax > maxAmount) {
        targetMax = maxAmount;
      }
      // targetMin remains propMin, but also capped by the new targetMax
      targetMin = Math.min(propMin, targetMax);
    }

    const newRange = [Math.max(0, targetMin), Math.max(0, targetMax)]; // Ensure range values are not negative

    // If currentFilters.amountRange needs to be updated based on these rules
    if (propMin !== newRange[0] || propMax !== newRange[1]) {
      onFilterChange({ ...currentFilters, amountRange: newRange });
      // After onFilterChange, currentFilters.amountRange prop will update,
      // and the sync effect above will update tempAmountRange.
    } else {
      // If onFilterChange was not called, it means currentFilters.amountRange is already consistent.
      // However, tempAmountRange might still need adjustment if:
      // 1. autoAdjustMax is true and tempAmountRange isn't reflecting maxAmount.
      // 2. autoAdjustMax is false, but maxAmount changed, and tempAmountRange is now out of bounds.
      let tempNeedsUpdate = false;
      let updatedTempRange = [...tempAmountRange]; // Create a mutable copy

      if (autoAdjustMax) {
        // If autoAdjustMax is true, tempAmountRange must conform to newRange (which reflects maxAmount)
        if (tempAmountRange[0] !== newRange[0] || tempAmountRange[1] !== newRange[1]) {
          tempNeedsUpdate = true;
          updatedTempRange = newRange;
        }
      } else {
        // If autoAdjustMax is false, tempAmountRange is generally user-driven.
        // It only needs updating if it violates the current maxAmount.
        // Slider handlers already cap against maxAmount, but maxAmount itself might change.
        const cappedTempMin = Math.max(0, Math.min(tempAmountRange[0], maxAmount));
        // Ensure max is not less than min, and also capped
        const cappedTempMax = Math.max(cappedTempMin, Math.min(tempAmountRange[1], maxAmount));

        const effectivelyCappedTemp = [cappedTempMin, cappedTempMax];

        if (tempAmountRange[0] !== effectivelyCappedTemp[0] || tempAmountRange[1] !== effectivelyCappedTemp[1]) {
          tempNeedsUpdate = true;
          updatedTempRange = effectivelyCappedTemp;
        }
      }

      if (tempNeedsUpdate) {
        setTempAmountRange(updatedTempRange);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxAmount, autoAdjustMax, currentFilters.amountRange, isLoadingData, onFilterChange]);


  const debouncedNotifyParent = useCallback(
    debounce((filtersToApply) => {
      if (onFilterChange) {
        onFilterChange(filtersToApply);
      }
    }, 300),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onFilterChange] // onFilterChange should be stable (e.g., memoized by parent)
  );

  const handleCategoryChange = (event) => {
    const { target: { value } } = event;
    const newCategories = typeof value === 'string' ? value.split(',') : value;
    const newFilters = { ...currentFilters, categories: newCategories };
    onFilterChange(newFilters); // Category changes are immediate
  };

  const handleAmountSliderChange = (event, newValue) => {
    // If user interacts with slider and autoAdjustMax is true, uncheck it.
    if (autoAdjustMax) {
      setAutoAdjustMax(false);
    }

    const newSliderValue = [
      Math.min(Math.max(0, newValue[0]), maxAmount),
      Math.min(Math.max(0, newValue[1]), maxAmount)
    ];
    // Ensure min is not greater than max
    if (newSliderValue[0] > newSliderValue[1]) {
      newSliderValue[0] = newSliderValue[1];
    }

    setTempAmountRange(newSliderValue);
    debouncedNotifyParent({ ...currentFilters, amountRange: newSliderValue });
  };

  const handleAmountSliderChangeCommitted = (event, newValue) => {
    // eslint-disable-next-line no-underscore-dangle
    if (debouncedNotifyParent._clearTimeout) debouncedNotifyParent._clearTimeout();

    // If user interacts with slider (e.g. clicks, or finishes drag) and autoAdjustMax is true, uncheck it.
    if (autoAdjustMax) {
      setAutoAdjustMax(false);
    }

    const finalSliderValue = [
      Math.min(Math.max(0, newValue[0]), maxAmount),
      Math.min(Math.max(0, newValue[1]), maxAmount)
    ];
    // Ensure min is not greater than max
    if (finalSliderValue[0] > finalSliderValue[1]) {
      finalSliderValue[0] = finalSliderValue[1];
    }

    setTempAmountRange(finalSliderValue); // Update temp range immediately for UI
    onFilterChange({ ...currentFilters, amountRange: finalSliderValue }); // Notify parent immediately
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
          max={maxAmount > 0 ? maxAmount : 100}
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

// src/modules/DynamicDashboard/widgets/FilterWidget.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Select, MenuItem, Checkbox, ListItemText,
    OutlinedInput, InputLabel, FormControl, Slider, Chip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import T from '../../../utils/T';
import { expenseCategories } from '../../../constants';

// Remove hardcoded max amount
// const MAX_SLIDER_AMOUNT = 5000;
const SLIDER_STEP = 50; // Keep step

export default function FilterWidget({
    onFilterChange,
    initialFilters = { categories: [], amountRange: [0, 1000] }, // Use a default max
    maxAmount // <-- Receive the calculated max amount prop
}) {
    const { t } = useTranslation();
    const [selectedCategories, setSelectedCategories] = useState(initialFilters.categories);
    // Amount range state: [min, max] - Initialize using initialFilters
    const [amountRange, setAmountRange] = useState(initialFilters.amountRange);

    // --- Sync internal state with props and adjust range if maxAmount changes ---
    useEffect(() => {
        // Update categories if initialFilters prop changes (e.g., reset button elsewhere)
        setSelectedCategories(initialFilters.categories);

        // Adjust amount range based on initialFilters and the current maxAmount prop
        const initialMin = initialFilters.amountRange[0];
        let initialMax = initialFilters.amountRange[1];

        // Clamp initialMax based on the *current* maxAmount prop
        if (initialMax > maxAmount) {
            initialMax = maxAmount;
        }
        // Ensure min is not greater than max
        const finalMin = Math.min(initialMin, initialMax);

        const newRange = [finalMin, initialMax];

        // Only update state if it's different to avoid infinite loops
        if (amountRange[0] !== newRange[0] || amountRange[1] !== newRange[1]) {
             setAmountRange(newRange);
             // Optionally notify parent if the range had to be adjusted on load/prop change
             // if (onFilterChange) {
             //    onFilterChange({ categories: initialFilters.categories, amountRange: newRange });
             // }
        }

    }, [initialFilters, maxAmount]); // Rerun when initialFilters or maxAmount prop changes
    // Removed amountRange and onFilterChange from dependencies to prevent loops


    // Debounced version of notifying the parent (keep as is)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        setSelectedCategories(newCategories);
        if (onFilterChange) {
            // Use the current amountRange state when notifying for category change
            onFilterChange({ categories: newCategories, amountRange: amountRange });
        }
    };

    const handleAmountSliderChange = (event, newValue) => {
        // Ensure the new value respects the dynamic maxAmount
        const adjustedValue = [
            Math.min(newValue[0], maxAmount), // Min shouldn't exceed max
            Math.min(newValue[1], maxAmount)  // Max shouldn't exceed max
        ];
        // Ensure min is not greater than max
        if (adjustedValue[0] > adjustedValue[1]) {
            adjustedValue[0] = adjustedValue[1];
        }
        setAmountRange(adjustedValue);
    };

    const handleAmountSliderChangeCommitted = (event, newValue) => {
         // Use the final value passed by the event (already clamped in handleAmountSliderChange)
         if (onFilterChange) {
             onFilterChange({ categories: selectedCategories, amountRange: newValue });
         }
    };

    const getTranslatedCategoryName = (categoryName) => {
        // ... (keep existing translation logic) ...
        const details = expenseCategories.find(cat => cat.name === categoryName);
        const key = details ? `expenseManager.category_${details.key}` : 'expenseManager.category_unknown';
        return t(key, { defaultValue: categoryName });
    };

    return (
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Category Filter (Keep as is) */}
            <FormControl fullWidth size="small">
                {/* ... Select component ... */}
                 <InputLabel id="category-multi-select-label">
                    <T>dynamicDashboard.filterByCategory</T>
                </InputLabel>
                <Select
                    labelId="category-multi-select-label"
                    multiple
                    value={selectedCategories}
                    onChange={handleCategoryChange}
                    input={<OutlinedInput label={t('dynamicDashboard.filterByCategory')} />}
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                           {selected.map((value) => (
                               <Chip key={value} label={getTranslatedCategoryName(value)} size="small" />
                           ))}
                        </Box>
                    )}
                    MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                >
                    {expenseCategories.map(({ name }) => (
                        <MenuItem key={name} value={name}>
                            <Checkbox checked={selectedCategories.indexOf(name) > -1} size="small"/>
                            <ListItemText primary={getTranslatedCategoryName(name)} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Amount Range Filter */}
            <Box>
                <Typography gutterBottom id="amount-range-slider-label">
                   {/* Display current range state */}
                   <T>dynamicDashboard.filterByAmount</T>: ${amountRange[0]} - ${amountRange[1]}
                </Typography>
                <Slider
                    value={amountRange}
                    onChange={handleAmountSliderChange}
                    onChangeCommitted={handleAmountSliderChangeCommitted}
                    valueLabelDisplay="auto"
                    min={0}
                    // --- Use dynamic maxAmount prop ---
                    max={maxAmount}
                    step={SLIDER_STEP}
                    getAriaValueText={(value) => `$${value}`}
                    aria-labelledby="amount-range-slider-label"
                    sx={{ mt: 1 }}
                    // Disable swap if needed for better UX with dynamic max
                    // disableSwap
                />
                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption">$0</Typography>
                    {/* --- Use dynamic maxAmount prop for label --- */}
                    <Typography variant="caption">${maxAmount}</Typography>
                 </Box>
            </Box>
        </Box>
    );
}

// Debounce function (keep as is)
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

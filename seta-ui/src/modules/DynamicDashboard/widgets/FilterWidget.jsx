// src/modules/DynamicDashboard/widgets/FilterWidget.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Select,
    MenuItem,
    Checkbox,
    ListItemText,
    OutlinedInput,
    InputLabel,
    FormControl,
    Slider,
    Chip // Optional: for displaying selected categories
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import T from '../../../utils/T';
import { expenseCategories } from '../../../constants'; // Import categories

// Determine a reasonable max amount for the slider.
// In a real app, you might calculate this from data or have a setting.
const MAX_SLIDER_AMOUNT = 5000;
const SLIDER_STEP = 50;

export default function FilterWidget({ onFilterChange, initialFilters = { categories: [], amountRange: [0, MAX_SLIDER_AMOUNT] } }) {
    const { t } = useTranslation();
    const [selectedCategories, setSelectedCategories] = useState(initialFilters.categories);
    // Amount range state: [min, max]
    const [amountRange, setAmountRange] = useState(initialFilters.amountRange);

    // --- Debounce Handler (Optional but Recommended for Sliders) ---
    // Basic debounce implementation
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    };

    // Debounced version of notifying the parent about filter changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedNotifyParent = useCallback(
        debounce((filters) => {
            if (onFilterChange) {
                onFilterChange(filters);
            }
        }, 500), // 500ms delay
        [onFilterChange] // Dependency array for useCallback
    );
    // --- End Debounce ---


    // Notify parent immediately on category change
    const handleCategoryChange = (event) => {
        const { target: { value } } = event;
        const newCategories = typeof value === 'string' ? value.split(',') : value;
        setSelectedCategories(newCategories);
        // Notify parent immediately for category changes
        if (onFilterChange) {
            onFilterChange({ categories: newCategories, amountRange });
        }
    };

    // Update local state immediately on slider change for responsiveness
    const handleAmountSliderChange = (event, newValue) => {
        setAmountRange(newValue);
         // Optionally call debounced update here if you want updates while dragging
         // debouncedNotifyParent({ categories: selectedCategories, amountRange: newValue });
    };

    // Notify parent only when slider interaction stops (onChangeCommitted)
    const handleAmountSliderChangeCommitted = (event, newValue) => {
         // Use the final value passed by the event
         if (onFilterChange) {
             onFilterChange({ categories: selectedCategories, amountRange: newValue });
         }
    };


    // Translate category name for display in Select
    const getTranslatedCategoryName = (categoryName) => {
        const details = expenseCategories.find(cat => cat.name === categoryName);
        const key = details ? `expenseManager.category_${details.key}` : 'expenseManager.category_unknown';
        return t(key, { defaultValue: categoryName });
    };

    return (
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Category Filter */}
            <FormControl fullWidth size="small">
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
                         // Optional: Display chips inside the select input
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                           {selected.map((value) => (
                               <Chip key={value} label={getTranslatedCategoryName(value)} size="small" />
                           ))}
                        </Box>
                        // Or just show count: `${selected.length} selected`
                    )}
                    MenuProps={{ // Prevent menu from overlapping input too much
                        PaperProps: { style: { maxHeight: 300 } },
                    }}
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
                   <T>dynamicDashboard.filterByAmount</T>: ${amountRange[0]} - ${amountRange[1]}
                </Typography>
                <Slider
                    getAriaLabel={() => t('dynamicDashboard.amountRange')}
                    value={amountRange}
                    onChange={handleAmountSliderChange} // Update state while dragging
                    onChangeCommitted={handleAmountSliderChangeCommitted} // Notify parent on release
                    valueLabelDisplay="auto"
                    min={0}
                    max={MAX_SLIDER_AMOUNT}
                    step={SLIDER_STEP}
                    getAriaValueText={(value) => `$${value}`}
                    aria-labelledby="amount-range-slider-label"
                    sx={{ mt: 1 }}
                />
                 {/* Optional: Display Min/Max labels below slider */}
                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption">$0</Typography>
                    <Typography variant="caption">${MAX_SLIDER_AMOUNT}</Typography>
                 </Box>
            </Box>
        </Box>
    );
}

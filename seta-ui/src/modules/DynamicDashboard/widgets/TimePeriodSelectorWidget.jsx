// src/modules/DynamicDashboard/widgets/TimePeriodSelectorWidget.jsx
import React, { useState, useEffect } from 'react'; // Added useEffect
import { Box, Button, Menu, MenuItem, TextField, Tooltip } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useTranslation } from 'react-i18next';
// Import more date-fns functions
import {
    startOfMonth, endOfMonth, subDays, startOfDay, endOfDay,
    startOfQuarter, endOfQuarter, startOfYear, endOfYear, getMonth, addMonths, isValid, parseISO // Added functions
} from 'date-fns';
import T from '../../../utils/T';

// --- localStorage Keys ---
const PRESET_STORAGE_KEY = 'dynamicDashboardTimePreset_v1';
const CUSTOM_START_STORAGE_KEY = 'dynamicDashboardCustomStart_v1';
const CUSTOM_END_STORAGE_KEY = 'dynamicDashboardCustomEnd_v1';
// ---

const PRESET_PERIODS = [
    { key: 'last7days', labelKey: 'timePeriods.last7days' },
    { key: 'last30days', labelKey: 'timePeriods.last30days' },
    { key: 'currentMonth', labelKey: 'timePeriods.currentMonth' },
    { key: 'currentQuarter', labelKey: 'timePeriods.currentQuarter' }, // New
    { key: 'currentHalfYear', labelKey: 'timePeriods.currentHalfYear' }, // New
    { key: 'allTime', labelKey: 'timePeriods.allTime' },
    { key: 'custom', labelKey: 'timePeriods.customRange' },
];

// --- Helper to calculate dates ---
const getDatesForPreset = (presetKey) => {
    const now = new Date();
    switch (presetKey) {
        case 'last7days':
            return { startDate: startOfDay(subDays(now, 6)), endDate: endOfDay(now) };
        case 'last30days':
            return { startDate: startOfDay(subDays(now, 29)), endDate: endOfDay(now) };
        case 'currentMonth':
            return { startDate: startOfDay(startOfMonth(now)), endDate: endOfDay(endOfMonth(now)) };
        case 'currentQuarter': // New
            return { startDate: startOfDay(startOfQuarter(now)), endDate: endOfDay(endOfQuarter(now)) };
        case 'currentHalfYear': { // New
            const currentMonth = getMonth(now); // 0-11
            const isFirstHalf = currentMonth < 6; // Jan-Jun (0-5)
            const yearStart = startOfYear(now);
            const yearEnd = endOfYear(now);
            const startDate = isFirstHalf ? startOfDay(yearStart) : startOfDay(addMonths(yearStart, 6));
            const endDate = isFirstHalf ? endOfDay(addMonths(yearStart, 5)) : endOfDay(yearEnd); // End of June or End of Dec
            return { startDate, endDate };
        }
        case 'allTime':
        default:
            return { startDate: null, endDate: null };
    }
};
// --- End Helper ---

// --- Component ---
export function TimePeriodSelectorWidget({ onPeriodChange }) { // Removed initialPeriod prop
    const { t } = useTranslation();

    // --- State Initialization from localStorage ---
    const [selectedPreset, setSelectedPreset] = useState(() => {
        return localStorage.getItem(PRESET_STORAGE_KEY) || 'currentMonth'; // Default to currentMonth
    });
    const [customStartDate, setCustomStartDate] = useState(() => {
        const savedStart = localStorage.getItem(CUSTOM_START_STORAGE_KEY);
        const parsedDate = savedStart ? parseISO(savedStart) : null;
        return isValid(parsedDate) ? parsedDate : null;
    });
    const [customEndDate, setCustomEndDate] = useState(() => {
        const savedEnd = localStorage.getItem(CUSTOM_END_STORAGE_KEY);
        const parsedDate = savedEnd ? parseISO(savedEnd) : null;
        return isValid(parsedDate) ? parsedDate : null;
    });
    // --- End State Initialization ---

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // --- Effect to notify parent on initial load ---
    useEffect(() => {
        let initialDates;
        if (selectedPreset === 'custom' && customStartDate && customEndDate) {
            initialDates = { startDate: startOfDay(customStartDate), endDate: endOfDay(customEndDate) };
        } else if (selectedPreset !== 'custom') {
            initialDates = getDatesForPreset(selectedPreset);
        } else {
            // Custom selected but dates invalid/missing, default to currentMonth
            initialDates = getDatesForPreset('currentMonth');
            setSelectedPreset('currentMonth'); // Update state to reflect default
            localStorage.setItem(PRESET_STORAGE_KEY, 'currentMonth');
            localStorage.removeItem(CUSTOM_START_STORAGE_KEY);
            localStorage.removeItem(CUSTOM_END_STORAGE_KEY);
        }
        onPeriodChange(initialDates);
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handlePresetSelect = (presetKey) => {
        setSelectedPreset(presetKey);
        localStorage.setItem(PRESET_STORAGE_KEY, presetKey); // Save preset
        handleClose();

        if (presetKey !== 'custom') {
            setCustomStartDate(null); // Clear custom dates
            setCustomEndDate(null);
            localStorage.removeItem(CUSTOM_START_STORAGE_KEY); // Clear saved custom dates
            localStorage.removeItem(CUSTOM_END_STORAGE_KEY);
            onPeriodChange(getDatesForPreset(presetKey)); // Notify parent
        } else {
            // If switching to custom, check if previously saved dates exist and are valid
            const savedStartStr = localStorage.getItem(CUSTOM_START_STORAGE_KEY);
            const savedEndStr = localStorage.getItem(CUSTOM_END_STORAGE_KEY);
            const savedStart = savedStartStr ? parseISO(savedStartStr) : null;
            const savedEnd = savedEndStr ? parseISO(savedEndStr) : null;

            if (isValid(savedStart) && isValid(savedEnd) && savedStart <= savedEnd) {
                setCustomStartDate(savedStart);
                setCustomEndDate(savedEnd);
                 onPeriodChange({ startDate: startOfDay(savedStart), endDate: endOfDay(savedEnd) });
            } else {
                // Don't call onPeriodChange yet, wait for user to select dates
                 setCustomStartDate(null); // Ensure state is clear if loaded dates were invalid
                 setCustomEndDate(null);
                 // Optionally call onPeriodChange with null/empty dates if needed
                 // onPeriodChange({ startDate: null, endDate: null });
            }
        }
    };

    const handleCustomDateChange = (type, date) => {
        let newStart = type === 'start' ? date : customStartDate;
        let newEnd = type === 'end' ? date : customEndDate;

        if (type === 'start') setCustomStartDate(date);
        if (type === 'end') setCustomEndDate(date);

        // Only update if both dates are valid and start is not after end
        if (newStart && newEnd && isValid(newStart) && isValid(newEnd) && newStart <= newEnd) {
             // Save custom dates to localStorage
             localStorage.setItem(CUSTOM_START_STORAGE_KEY, newStart.toISOString());
             localStorage.setItem(CUSTOM_END_STORAGE_KEY, newEnd.toISOString());
             // Notify parent
             onPeriodChange({
                 startDate: startOfDay(newStart),
                 endDate: endOfDay(newEnd)
             });
        }
    };

    const getSelectedLabel = () => {
        const selected = PRESET_PERIODS.find(p => p.key === selectedPreset);
        return selected ? t(selected.labelKey) : t('timePeriods.selectPeriod');
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                 <Tooltip title={t('timePeriods.selectPeriodTooltip')}>
                    <Button
                        id="period-button"
                        aria-controls={open ? 'period-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        variant="outlined"
                        onClick={handleClick}
                        size="small"
                        startIcon={<CalendarTodayIcon />}
                        endIcon={<ArrowDropDownIcon />}
                        sx={{ textTransform: 'none' }}
                    >
                        {getSelectedLabel()}
                    </Button>
                </Tooltip>
                <Menu
                    id="period-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{ 'aria-labelledby': 'period-button' }}
                >
                    {PRESET_PERIODS.map(period => (
                        <MenuItem
                            key={period.key}
                            selected={period.key === selectedPreset}
                            onClick={() => handlePresetSelect(period.key)}
                        >
                            {t(period.labelKey)}
                        </MenuItem>
                    ))}
                </Menu>

                {selectedPreset === 'custom' && (
                    <>
                        <DatePicker
                            label={<T>timePeriods.startDate</T>}
                            value={customStartDate}
                            onChange={(date) => handleCustomDateChange('start', date)}
                            slotProps={{ textField: { size: 'small', sx:{ maxWidth: 160 } } }}
                            maxDate={customEndDate || undefined}
                        />
                        <DatePicker
                            label={<T>timePeriods.endDate</T>}
                            value={customEndDate}
                            onChange={(date) => handleCustomDateChange('end', date)}
                            slotProps={{ textField: { size: 'small', sx:{ maxWidth: 160 } } }}
                            minDate={customStartDate || undefined}
                        />
                    </>
                )}
            </LocalizationProvider>
        </Box>
    );
}

export default React.memo(TimePeriodSelectorWidget);

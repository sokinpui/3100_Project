// src/modules/DynamicDashboard/widgets/TimePeriodSelectorWidget.jsx
import React, { useState, useEffect } from 'react';
import { Box, Button, Menu, MenuItem, TextField, Tooltip } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useTranslation } from 'react-i18next';
import {
    startOfMonth, endOfMonth, subDays, startOfDay, endOfDay,
    startOfQuarter, endOfQuarter, startOfYear, endOfYear, getMonth, addMonths, isValid, parseISO,
    subYears
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
    { key: 'currentQuarter', labelKey: 'timePeriods.currentQuarter' },
    { key: 'currentHalfYear', labelKey: 'timePeriods.currentHalfYear' },
    { key: 'thisYear', labelKey: 'timePeriods.thisYear' }, // New "This Year" option
    { key: 'lastYear', labelKey: 'timePeriods.lastYear' },
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
        case 'currentQuarter':
            return { startDate: startOfDay(startOfQuarter(now)), endDate: endOfDay(endOfQuarter(now)) };
        case 'currentHalfYear': {
            const currentMonth = getMonth(now);
            const isFirstHalf = currentMonth < 6;
            const yearStart = startOfYear(now);
            const yearEnd = endOfYear(now);
            const firstHalfEndDate = endOfDay(endOfMonth(addMonths(yearStart, 5)));
            const startDate = isFirstHalf ? startOfDay(yearStart) : startOfDay(addMonths(yearStart, 6));
            const endDate = isFirstHalf ? firstHalfEndDate : endOfDay(yearEnd);
            return { startDate, endDate };
        }
        case 'thisYear': { // New case for "This Year"
            return {
                startDate: startOfDay(startOfYear(now)),
                endDate: endOfDay(endOfYear(now))
            };
        }
        case 'lastYear': {
            const lastYearDate = subYears(now, 1);
            return {
                startDate: startOfDay(startOfYear(lastYearDate)),
                endDate: endOfDay(endOfYear(lastYearDate))
            };
        }
        case 'allTime':
        default:
            return { startDate: null, endDate: null };
    }
};
// --- End Helper ---

// --- Component ---
export function TimePeriodSelectorWidget({ onPeriodChange }) {
    const { t } = useTranslation();

    const [selectedPreset, setSelectedPreset] = useState(() => {
        return localStorage.getItem(PRESET_STORAGE_KEY) || 'currentMonth';
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

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    useEffect(() => {
        let initialDates;
        if (selectedPreset === 'custom' && customStartDate && customEndDate && isValid(customStartDate) && isValid(customEndDate)) {
            initialDates = { startDate: startOfDay(customStartDate), endDate: endOfDay(customEndDate) };
        } else if (selectedPreset !== 'custom') {
            initialDates = getDatesForPreset(selectedPreset);
        } else {
            initialDates = getDatesForPreset('currentMonth');
            setSelectedPreset('currentMonth');
            localStorage.setItem(PRESET_STORAGE_KEY, 'currentMonth');
            localStorage.removeItem(CUSTOM_START_STORAGE_KEY);
            localStorage.removeItem(CUSTOM_END_STORAGE_KEY);
        }
        onPeriodChange({...initialDates, presetKey: selectedPreset});
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handlePresetSelect = (presetKey) => {
        setSelectedPreset(presetKey);
        localStorage.setItem(PRESET_STORAGE_KEY, presetKey);
        handleClose();

        if (presetKey !== 'custom') {
            setCustomStartDate(null);
            setCustomEndDate(null);
            localStorage.removeItem(CUSTOM_START_STORAGE_KEY);
            localStorage.removeItem(CUSTOM_END_STORAGE_KEY);
            onPeriodChange({...getDatesForPreset(presetKey), presetKey: presetKey});
        } else {
            const savedStartStr = localStorage.getItem(CUSTOM_START_STORAGE_KEY);
            const savedEndStr = localStorage.getItem(CUSTOM_END_STORAGE_KEY);
            const savedStart = savedStartStr ? parseISO(savedStartStr) : null;
            const savedEnd = savedEndStr ? parseISO(savedEndStr) : null;

            if (isValid(savedStart) && isValid(savedEnd) && savedStart <= savedEnd) {
                setCustomStartDate(savedStart);
                setCustomEndDate(savedEnd);
                 onPeriodChange({ startDate: startOfDay(savedStart), endDate: endOfDay(savedEnd), presetKey: 'custom' });
            } else {
                 setCustomStartDate(null);
                 setCustomEndDate(null);
                 onPeriodChange({ startDate: null, endDate: null, presetKey: 'custom' });
            }
        }
    };

    const handleCustomDateChange = (type, date) => {
        let newStart = type === 'start' ? date : customStartDate;
        let newEnd = type === 'end' ? date : customEndDate;

        if (type === 'start') setCustomStartDate(date);
        if (type === 'end') setCustomEndDate(date);

        if (newStart && newEnd && isValid(newStart) && isValid(newEnd) && newStart <= newEnd) {
             localStorage.setItem(CUSTOM_START_STORAGE_KEY, newStart.toISOString());
             localStorage.setItem(CUSTOM_END_STORAGE_KEY, newEnd.toISOString());
             onPeriodChange({
                 startDate: startOfDay(newStart),
                 endDate: endOfDay(newEnd),
                 presetKey: 'custom'
             });
        } else if (newStart && isValid(newStart)) {
            if (type === 'start') localStorage.setItem(CUSTOM_START_STORAGE_KEY, newStart.toISOString());
        } else if (newEnd && isValid(newEnd)) {
            if (type === 'end') localStorage.setItem(CUSTOM_END_STORAGE_KEY, newEnd.toISOString());
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

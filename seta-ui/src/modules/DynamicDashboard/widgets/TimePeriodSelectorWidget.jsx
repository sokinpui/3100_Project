import React, { useState } from 'react';
import { Box, Button, ButtonGroup, Menu, MenuItem, TextField, Tooltip } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'; // Use v3 adapter if using date-fns v3
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useTranslation } from 'react-i18next';
import { startOfMonth, endOfMonth, subDays, startOfDay, endOfDay } from 'date-fns';
import T from '../../../utils/T';


const PRESET_PERIODS = [
    { key: 'last7days', labelKey: 'timePeriods.last7days' },
    { key: 'last30days', labelKey: 'timePeriods.last30days' },
    { key: 'currentMonth', labelKey: 'timePeriods.currentMonth' },
    { key: 'allTime', labelKey: 'timePeriods.allTime' },
    { key: 'custom', labelKey: 'timePeriods.customRange' },
];

export default function TimePeriodSelectorWidget({ initialPeriod = 'currentMonth', onPeriodChange }) {
    const { t } = useTranslation();
    const [selectedPreset, setSelectedPreset] = useState(initialPeriod);
    const [customStartDate, setCustomStartDate] = useState(null);
    const [customEndDate, setCustomEndDate] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handlePresetSelect = (presetKey) => {
        setSelectedPreset(presetKey);
        handleClose();
        if (presetKey !== 'custom') {
            setCustomStartDate(null);
            setCustomEndDate(null);
            onPeriodChange(getDatesForPreset(presetKey));
        } else {
            // For custom, don't call onPeriodChange until dates are selected
            if (customStartDate && customEndDate) {
                 onPeriodChange({
                    startDate: startOfDay(customStartDate),
                    endDate: endOfDay(customEndDate)
                });
            }
        }
    };

    const handleCustomDateChange = (type, date) => {
        let start = type === 'start' ? date : customStartDate;
        let end = type === 'end' ? date : customEndDate;

        if (type === 'start') setCustomStartDate(date);
        if (type === 'end') setCustomEndDate(date);

        // Only update if both dates are set
        if (start && end && start <= end) {
             onPeriodChange({
                 startDate: startOfDay(start),
                 endDate: endOfDay(end)
             });
        }
    };

    const getDatesForPreset = (presetKey) => {
        const now = new Date();
        switch (presetKey) {
            case 'last7days':
                return { startDate: startOfDay(subDays(now, 6)), endDate: endOfDay(now) };
            case 'last30days':
                return { startDate: startOfDay(subDays(now, 29)), endDate: endOfDay(now) };
            case 'currentMonth':
                return { startDate: startOfDay(startOfMonth(now)), endDate: endOfDay(endOfMonth(now)) };
            case 'allTime':
            default:
                return { startDate: null, endDate: null }; // Representing all time
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
                            maxDate={customEndDate || undefined} // Prevent start date after end date
                        />
                        <DatePicker
                            label={<T>timePeriods.endDate</T>}
                            value={customEndDate}
                            onChange={(date) => handleCustomDateChange('end', date)}
                            slotProps={{ textField: { size: 'small', sx:{ maxWidth: 160 } } }}
                            minDate={customStartDate || undefined} // Prevent end date before start date
                        />
                    </>
                )}
            </LocalizationProvider>
        </Box>
    );
}

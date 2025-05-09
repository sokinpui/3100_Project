// src/modules/DynamicDashboard/widgets/MiniCalendarWidget.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Tooltip, IconButton } from '@mui/material';
import {
    format, parseISO, isValid, startOfMonth, endOfMonth, eachDayOfInterval, getDay,
    isSameMonth, subMonths, addMonths
} from 'date-fns';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import T from '../../../utils/T';
import { useTheme } from '@mui/material/styles'; // To use theme colors
import { useTranslation } from 'react-i18next';
import { useLocalizedDateFormat } from '../../../utils/useLocalizedDateFormat';

// Helper to get days of the month including padding for start day
const getMonthDays = (monthDate) => {
    if (!isValid(monthDate)) return []; // Handle invalid date input
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const daysInMonth = eachDayOfInterval({ start, end });
    const firstDayOfWeek = getDay(start); // 0 for Sunday
    const padding = Array(firstDayOfWeek).fill(null);
    return [...padding, ...daysInMonth];
};

// Helper to calculate color based on NET FLOW amount
const getNetFlowHeatmapColor = (netFlow, maxAbsNetFlow, theme) => {
    if (netFlow === 0 || maxAbsNetFlow === 0) return 'transparent'; // No net flow or no max

    const intensity = Math.min(Math.abs(netFlow) / maxAbsNetFlow, 1); // Normalize intensity (0 to 1)

    if (netFlow > 0) { // Positive Net Flow (Income > Expense) - Shades of Green
        if (intensity < 0.1) return theme.palette.mode === 'dark' ? '#4caf5030' : '#e8f5e9'; // Very Light Green
        if (intensity < 0.4) return theme.palette.mode === 'dark' ? '#66bb6a' : '#a5d6a7'; // Light Green
        return theme.palette.mode === 'dark' ? '#388e3c' : '#66bb6a'; // Medium/Dark Green
    } else { // Negative Net Flow (Expense > Income) - Shades of Red
        if (intensity < 0.1) return theme.palette.mode === 'dark' ? '#f4433630' : '#ffebee'; // Very Light Red
        if (intensity < 0.4) return theme.palette.mode === 'dark' ? '#ef5350' : '#ef9a9a'; // Light Red
        return theme.palette.mode === 'dark' ? '#d32f2f' : '#ef5350'; // Medium/Dark Red
    }
};


export function MiniCalendarWidget({ expenses = [], income = [], timePeriod }) {
    const theme = useTheme();
    const { t } = useTranslation();
    const { format: formatLocaleDate, locale } = useLocalizedDateFormat();

    // State for the currently displayed month
    const [displayMonth, setDisplayMonth] = useState(() => {
        // Initialize with the start date of the timePeriod, or current date
        return (timePeriod?.startDate && isValid(timePeriod.startDate))
               ? startOfMonth(timePeriod.startDate) // Use start of the month from period
               : startOfMonth(new Date());
    });

    // Recalculate when timePeriod prop changes from dashboard
    useEffect(() => {
        setDisplayMonth(
             (timePeriod?.startDate && isValid(timePeriod.startDate))
               ? startOfMonth(timePeriod.startDate)
               : startOfMonth(new Date())
        )
    }, [timePeriod?.startDate]);


    const days = useMemo(() => getMonthDays(displayMonth), [displayMonth]);
    const monthName = isValid(displayMonth) ? formatLocaleDate(displayMonth, 'MMMM yyyy') : 'Invalid Date';

    // Calculate daily net flows and max absolute value for the displayed month
    const { dailyNetFlows, maxAbsNetFlow } = useMemo(() => {
        const dailyMap = {}; // Key: 'YYYY-MM-DD', Value: { income: X, expense: Y }

        // Process Income for the specific displayMonth
        income.forEach(inc => {
            try {
                const date = parseISO(inc.date);
                 if (isValid(date) && isSameMonth(date, displayMonth)) {
                    const dayString = format(date, 'yyyy-MM-dd');
                    const amount = parseFloat(inc.amount) || 0;
                    if (!dailyMap[dayString]) dailyMap[dayString] = { income: 0, expense: 0 };
                    dailyMap[dayString].income += amount;
                }
            } catch (e) { /* ignore */ }
        });

        // Process Expenses for the specific displayMonth
        expenses.forEach(exp => {
            try {
                const date = parseISO(exp.date);
                 if (isValid(date) && isSameMonth(date, displayMonth)) {
                    const dayString = format(date, 'yyyy-MM-dd');
                    const amount = parseFloat(exp.amount) || 0;
                    if (!dailyMap[dayString]) dailyMap[dayString] = { income: 0, expense: 0 };
                    dailyMap[dayString].expense += amount;
                }
            } catch (e) { /* ignore */ }
        });

        // Calculate net flow and find max absolute value
        let maxAbs = 0;
        const netFlows = {};
        Object.entries(dailyMap).forEach(([dayString, totals]) => {
            const net = totals.income - totals.expense;
            netFlows[dayString] = net;
            if (Math.abs(net) > maxAbs) {
                maxAbs = Math.abs(net);
            }
        });

        return { dailyNetFlows: netFlows, maxAbsNetFlow: Math.max(1, maxAbs) }; // Ensure max is at least 1

    }, [expenses, income, displayMonth]);

    const handlePrevMonth = () => {
        setDisplayMonth(prev => subMonths(prev, 1));
    };

    const handleNextMonth = () => {
         setDisplayMonth(prev => addMonths(prev, 1));
    };

    const weekDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            // Get the name for Sunday (index 0) + i days, format as short weekday name
            days.push(locale.localize.day(i, { width: 'medium' }));
        }
        return days;
    }, [locale]);

    const hasDataForMonth = Object.keys(dailyNetFlows).length > 0;

    return (
        <Box sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
             {/* Month Navigation Header */}
             <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                 <IconButton onClick={handlePrevMonth} size="small" aria-label={'Previous month'}>
                     <ChevronLeftIcon />
                 </IconButton>
                 <Typography variant="subtitle2" align="center" sx={{ flexGrow: 1 }}>
                    {monthName}
                 </Typography>
                 <IconButton onClick={handleNextMonth} size="small" aria-label={'Next month'}>
                     <ChevronRightIcon />
                 </IconButton>
            </Box>

            {/* Calendar Grid */}
            <Grid container columns={7} spacing={0.5} sx={{ flexGrow: 1 }}>
                {/* Weekday Headers */}
                {weekDays.map(wd => (
                    <Grid item xs={1} key={wd} sx={{ textAlign: 'center', pb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">{wd}</Typography>
                    </Grid>
                ))}
                {/* Day Cells */}
                {days.map((day, index) => {
                    const dayString = day ? format(day, 'yyyy-MM-dd') : null;
                    const netFlow = dayString ? (dailyNetFlows[dayString] || 0) : 0;
                    const color = day ? getNetFlowHeatmapColor(netFlow, maxAbsNetFlow, theme) : 'transparent';
                    const isToday = day && format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

                    return (
                        <Grid item xs={1} key={day ? dayString : `pad-${index}`} sx={{ aspectRatio: '1 / 1' }}>
                            {day && (
                                <Tooltip
                                    // Add specific translation key
                                    title={netFlow !== 0 ? `${t('dynamicDashboard.netFlow')}: ${netFlow >= 0 ? '+' : ''}${formatCurrency(netFlow)}` : ''}
                                    placement="top"
                                    arrow
                                >
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            height: '100%',
                                            width: '100%', // Ensure paper fills grid item
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: color,
                                            borderColor: isToday ? theme.palette.primary.main : theme.palette.divider, // Highlight today
                                            borderWidth: isToday ? '1px' : '1px',
                                            cursor: 'default', // Or make clickable later
                                            transition: 'background-color 0.2s ease-in-out',
                                            '&:hover': { // Subtle hover effect
                                                borderColor: theme.palette.text.primary,
                                                // backgroundColor: netFlow !== 0 ? alpha(color, 0.8) : undefined // Example hover effect
                                            }
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontWeight: isToday ? 'bold' : 'normal',
                                                color: isToday ? theme.palette.primary.main : 'inherit', // Highlight today's number
                                                fontSize: '0.7rem' // Adjust font size if needed
                                            }}
                                        >
                                            {format(day, 'd')}
                                        </Typography>
                                    </Paper>
                                </Tooltip>
                            )}
                        </Grid>
                    );
                })}
            </Grid>
             {/* Placeholder if no data */}
            {!hasDataForMonth && (
                 <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, mt: -4 /* Adjust overlap */ }}>
                    <Typography variant="caption" color="text.disabled">
                         {/* Add specific translation key */}
                        <T>dynamicDashboard.noDataForMonth</T>
                    </Typography>
                </Box>
            )}
        </Box>
    );
}

// Helper function (can be moved to utils if used elsewhere)
function formatCurrency(value) {
    const num = parseFloat(value);
    return isNaN(num) ? '-' : `$${num.toFixed(2)}`;
}

export default React.memo(MiniCalendarWidget);

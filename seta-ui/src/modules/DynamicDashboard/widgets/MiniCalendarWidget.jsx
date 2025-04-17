// src/modules/DynamicDashboard/widgets/MiniCalendarWidget.jsx
import React, { useMemo } from 'react';
import { Box, Typography, Grid, Paper, Tooltip } from '@mui/material';
import {
    format, parseISO, isValid, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth
} from 'date-fns';
import T from '../../../utils/T';
import { useTheme } from '@mui/material/styles'; // To use theme colors

// Helper to get days of the month including padding for start day
const getMonthDays = (monthDate) => {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const daysInMonth = eachDayOfInterval({ start, end });

    // Add padding for the first day of the week (0=Sun, 1=Mon, etc.)
    const firstDayOfWeek = getDay(start); // 0 for Sunday, 1 for Monday...
    const padding = Array(firstDayOfWeek).fill(null);

    return [...padding, ...daysInMonth];
};

// Helper to calculate color based on amount (example)
const getHeatmapColor = (amount, maxAmount, theme) => {
    if (amount <= 0) return 'transparent'; // No spending
    // Normalize amount (0 to 1) - cap at maxAmount for color scaling
    const intensity = Math.min(amount / (maxAmount || 1), 1);

    // Example: Green to Red scale using theme palette if possible
    if (intensity < 0.1) return theme.palette.mode === 'dark' ? '#388e3c40' : '#c8e6c940'; // Light Green (with alpha)
    if (intensity < 0.3) return theme.palette.mode === 'dark' ? '#66bb6a' : '#a5d6a7';
    if (intensity < 0.6) return theme.palette.mode === 'dark' ? '#ffa726' : '#ffcc80'; // Orange
    return theme.palette.mode === 'dark' ? '#ef5350' : '#ef9a9a'; // Red
};


export default function MiniCalendarWidget({ expenses, timePeriod }) {
    const theme = useTheme();

    // Determine the month to display
    const displayMonth = useMemo(() => {
        // Prioritize start date of the time period, else use current date
        return (timePeriod?.startDate && isValid(timePeriod.startDate))
               ? timePeriod.startDate
               : new Date();
    }, [timePeriod]);

    const days = useMemo(() => getMonthDays(displayMonth), [displayMonth]);
    const monthName = format(displayMonth, 'MMMM yyyy');

    // Group expenses by day string 'yyyy-MM-dd'
    const dailyTotals = useMemo(() => {
        return expenses.reduce((acc, exp) => {
            try {
                const date = parseISO(exp.date);
                 // Ensure the expense date is within the *displayed* month
                if (isValid(date) && isSameMonth(date, displayMonth)) {
                    const dayString = format(date, 'yyyy-MM-dd');
                    acc[dayString] = (acc[dayString] || 0) + (parseFloat(exp.amount) || 0);
                }
            } catch (e) { console.error("Error processing expense for calendar:", e); }
            return acc;
        }, {});
    }, [expenses, displayMonth]);

    // Find max daily total for color scaling
    const maxDailyTotal = useMemo(() => Math.max(1, ...Object.values(dailyTotals)), [dailyTotals]); // Ensure max is at least 1

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; // Or use date-fns locale later

    return (
        <Box sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
             <Typography variant="subtitle2" align="center" gutterBottom>
                {monthName}
            </Typography>
            <Grid container columns={7} spacing={0.5} sx={{ flexGrow: 1 }}>
                {/* Weekday Headers */}
                {weekDays.map(wd => (
                    <Grid item xs={1} key={wd} sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">{wd}</Typography>
                    </Grid>
                ))}
                {/* Day Cells */}
                {days.map((day, index) => {
                    const dayString = day ? format(day, 'yyyy-MM-dd') : null;
                    const total = dayString ? (dailyTotals[dayString] || 0) : 0;
                    const color = day ? getHeatmapColor(total, maxDailyTotal, theme) : 'transparent';

                    return (
                        <Grid item xs={1} key={day ? dayString : `pad-${index}`} sx={{ aspectRatio: '1 / 1' }}>
                            {day && (
                                <Tooltip title={total > 0 ? `$${total.toFixed(2)}` : ''} placement="top">
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: color,
                                            borderColor: theme.palette.divider,
                                            cursor: total > 0 ? 'pointer' : 'default', // Indicate clickability
                                            '&:hover': {
                                                borderColor: total > 0 ? theme.palette.primary.main : theme.palette.divider,
                                                boxShadow: total > 0 ? 1 : 0,
                                            }
                                        }}
                                        // onClick={() => { /* TODO: Handle day click */ }}
                                    >
                                        <Typography variant="caption" sx={{ fontWeight: isSameMonth(day, new Date()) && format(day, 'd') === format(new Date(), 'd') ? 'bold' : 'normal' }}>
                                            {format(day, 'd')}
                                        </Typography>
                                    </Paper>
                                </Tooltip>
                            )}
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}

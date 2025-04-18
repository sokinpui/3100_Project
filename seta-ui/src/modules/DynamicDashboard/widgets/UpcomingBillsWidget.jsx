// src/modules/DynamicDashboard/widgets/UpcomingBillsWidget.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, List, ListItem, ListItemText, Divider } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import axios from 'axios';
import { format, parseISO, addDays, isWithinInterval, addMonths, addWeeks, addYears } from 'date-fns'; // Import date functions
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';

const API_URL = 'http://localhost:8000';
const UPCOMING_DAYS = 14; // Show bills due in the next 14 days

// Basic function to estimate next due date (Needs refinement for accuracy)
const estimateNextDueDate = (recExp) => {
    try {
        const startDate = parseISO(recExp.start_date);
        const today = new Date();
        let nextDate = startDate;

        if (nextDate > today) return nextDate; // If start date is in the future

        // Crude calculation - assumes it started in the past and repeats regularly
        // This doesn't handle end dates or complex frequencies perfectly
        switch (recExp.frequency) {
            case 'weekly':
                while (nextDate <= today) nextDate = addWeeks(nextDate, 1);
                break;
            case 'monthly':
                while (nextDate <= today) nextDate = addMonths(nextDate, 1);
                break;
            case 'quarterly':
                 while (nextDate <= today) nextDate = addMonths(nextDate, 3);
                 break;
            case 'yearly':
                while (nextDate <= today) nextDate = addYears(nextDate, 1);
                break;
            default: // daily or one_time - won't show as upcoming after start
                 return null;
        }
        return nextDate;
    } catch (e) {
        console.error("Error calculating next due date:", e);
        return null;
    }
};


export function UpcomingBillsWidget({ userId }) {
    const { t } = useTranslation();
    const [upcomingBills, setUpcomingBills] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecurring = async () => {
            if (!userId) return;
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${API_URL}/recurring/${userId}`);
                const today = new Date();
                const upcomingLimit = addDays(today, UPCOMING_DAYS);

                const upcoming = response.data
                    .map(rec => ({ ...rec, nextDueDate: estimateNextDueDate(rec) }))
                    .filter(rec => rec.nextDueDate && isWithinInterval(rec.nextDueDate, { start: today, end: upcomingLimit }))
                    .sort((a, b) => a.nextDueDate - b.nextDueDate); // Sort by next due date

                setUpcomingBills(upcoming);
            } catch (err) {
                console.error("Error fetching recurring expenses:", err);
                setError(t('dynamicDashboard.fetchError')); // Add generic fetch error translation
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecurring();
    }, [userId, t]);

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress size={30} /></Box>;
    }

    if (error) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 1, textAlign: 'center' }}><Typography color="error" variant="caption">{error}</Typography></Box>;
    }

    if (upcomingBills.length === 0) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', p: 2, textAlign: 'center' }}>
                <EventNoteIcon color="disabled" sx={{ fontSize: 30, mb: 1 }} />
                <Typography color="text.secondary" variant="body2">
                    <T>dynamicDashboard.noUpcomingBills</T> {/* Add new translation key */}
                </Typography>
            </Box>
        );
    }

    return (
        <List dense sx={{ height: '100%', overflowY: 'auto', p: 0 }}>
            {upcomingBills.map((bill, index) => (
                <React.Fragment key={bill.id}>
                    <ListItem sx={{ py: 1 }}>
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" fontWeight={500}>{bill.name}</Typography>
                                    <Typography variant="body2" fontWeight="bold">${parseFloat(bill.amount).toFixed(2)}</Typography>
                                </Box>
                            }
                            secondary={
                                <Typography variant="caption" color="text.secondary">
                                    Due: {format(bill.nextDueDate, 'MMM d, yyyy')}
                                </Typography>
                            }
                        />
                    </ListItem>
                    {index < upcomingBills.length - 1 && <Divider component="li" />}
                </React.Fragment>
            ))}
        </List>
    );
}

export default React.memo(UpcomingBillsWidget);

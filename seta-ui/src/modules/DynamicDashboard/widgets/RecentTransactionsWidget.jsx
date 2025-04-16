import React, { useMemo } from 'react';
import { Box, Typography, CircularProgress, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';
import { format as formatDateFns } from 'date-fns'; // Use date-fns directly
import { getCategoryDetails } from '../../../constants';
import { useTranslation } from 'react-i18next';
import T from '../../../utils/T';

const MAX_ITEMS = 5; // Max recent transactions to show

export default function RecentTransactionsWidget({ expenses, isLoading }) {
    const { t } = useTranslation();

    const recentExpenses = useMemo(() => {
        return [...expenses] // Create shallow copy before sorting
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort descending by date
            .slice(0, MAX_ITEMS); // Take top N
    }, [expenses]);

    const formatDate = (dateString) => {
        try {
            return formatDateFns(new Date(dateString), 'MMM d'); // Format like 'Jan 15'
        } catch {
            return dateString; // Fallback
        }
    }

     const getTranslatedCategory = (name) => {
        const details = getCategoryDetails(name);
        const key = details ? `expenseManager.category_${details.key}` : 'expenseManager.category_unknown';
        return t(key, { defaultValue: name });
     }

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
    }

    if (recentExpenses.length === 0) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="text.secondary"><T>dynamicDashboard.noRecentTransactions</T></Typography></Box>;
    }

    return (
        <List disablePadding dense>
            {recentExpenses.map((exp, index) => (
                <React.Fragment key={exp.id}>
                    <ListItem sx={{ py: 1.5 }}>
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {getTranslatedCategory(exp.category_name)}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                        ${parseFloat(exp.amount).toFixed(2)}
                                    </Typography>
                                </Box>
                            }
                            secondary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                                     <Typography variant="caption" color="text.secondary">
                                        {exp.description || <T>dynamicDashboard.noDescription</T>}
                                    </Typography>
                                    <Chip label={formatDate(exp.date)} size="small" variant="outlined" sx={{ height: 'auto', fontSize: '0.7rem' }}/>

                                </Box>
                            }
                        />
                    </ListItem>
                    {index < recentExpenses.length - 1 && <Divider component="li" variant="inset" />}
                </React.Fragment>
            ))}
        </List>
    );
}

// src/modules/DynamicDashboard/widgets/RecentTransactionsWidget.jsx
import React, { useMemo } from 'react';
import { Box, Typography, CircularProgress, List, ListItem, ListItemText, Divider, Chip, Icon } from '@mui/material';
import { format, parseISO, isValid } from 'date-fns';
import { getCategoryDetails } from '../../../constants';
import { useTranslation } from 'react-i18next';
import T from '../../../utils/T';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'; // For Expenses
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';   // For Income
import { useTheme } from '@mui/material/styles'; // To use theme colors

const MAX_ITEMS = 7; // Increase slightly to show more mixed items

export default function RecentTransactionsWidget({ expenses = [], income = [], isLoading }) {
    const { t } = useTranslation();
    const theme = useTheme();

    const combinedTransactions = useMemo(() => {
        const mappedExpenses = expenses.map(exp => ({
            id: `exp-${exp.id}`, // Ensure unique key
            type: 'expense',
            date: exp.date,
            amount: parseFloat(exp.amount) || 0,
            displayName: getCategoryDetails(exp.category_name) // Get category details for translation key
                         ? t(`expenseManager.category_${getCategoryDetails(exp.category_name).key}`, { defaultValue: exp.category_name })
                         : exp.category_name || t('expenseManager.category_unknown'), // Fallback category name
            description: exp.description,
        }));

        const mappedIncome = income.map(inc => ({
            id: `inc-${inc.id}`, // Ensure unique key
            type: 'income',
            date: inc.date,
            amount: parseFloat(inc.amount) || 0,
            displayName: inc.source, // Use source as display name for income
            description: inc.description,
        }));

        return [...mappedExpenses, ...mappedIncome]
            .sort((a, b) => {
                // Handle potentially invalid dates during sort
                const dateA = a.date ? parseISO(a.date) : null;
                const dateB = b.date ? parseISO(b.date) : null;
                if (!isValid(dateA) && !isValid(dateB)) return 0;
                if (!isValid(dateA)) return 1; // Put invalid dates last
                if (!isValid(dateB)) return -1;
                return dateB.getTime() - dateA.getTime(); // Sort descending
            })
            .slice(0, MAX_ITEMS); // Take top N
    }, [expenses, income, t]);

    const formatDate = (dateString) => {
        try {
            // Use parseISO for reliability with 'YYYY-MM-DD'
            const date = parseISO(dateString);
            return isValid(date) ? format(date, 'MMM d') : dateString;
        } catch {
            return dateString; // Fallback
        }
    };

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
    }

    if (combinedTransactions.length === 0) {
        // Update empty message
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 1, textAlign: 'center' }}><Typography color="text.secondary"><T>dynamicDashboard.noRecentTransactions</T></Typography></Box>;
    }

    return (
        // Adjust List padding if needed
        <List disablePadding dense sx={{ height: '100%', overflowY: 'auto', px: 1 }}>
            {combinedTransactions.map((item, index) => {
                const isExpense = item.type === 'expense';
                const amountColor = isExpense ? theme.palette.error.main : theme.palette.success.main;
                const IconComponent = isExpense ? ArrowDownwardIcon : ArrowUpwardIcon;

                return (
                    <React.Fragment key={item.id}>
                        <ListItem sx={{ py: 1.5, alignItems: 'flex-start' }}> {/* Align items top */}
                             {/* Icon Column */}
                             <Box sx={{ mr: 1.5, mt: 0.5, color: amountColor }}>
                                <IconComponent fontSize="small" />
                            </Box>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap title={item.displayName}>
                                            {item.displayName}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: amountColor, ml: 1, flexShrink: 0 }}>
                                            {isExpense ? '-' : '+'}${item.amount.toFixed(2)}
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="caption" color="text.secondary" noWrap sx={{ mr: 1 }} title={item.description}>
                                            {item.description || <T>dynamicDashboard.noDescription</T>}
                                        </Typography>
                                        <Chip label={formatDate(item.date)} size="small" variant="outlined" sx={{ height: 'auto', fontSize: '0.7rem', flexShrink: 0 }}/>
                                    </Box>
                                }
                            />
                        </ListItem>
                        {index < combinedTransactions.length - 1 && <Divider component="li" variant="inset" sx={{ ml: 6 }} />} {/* Indent divider */}
                    </React.Fragment>
                );
            })}
        </List>
    );
}

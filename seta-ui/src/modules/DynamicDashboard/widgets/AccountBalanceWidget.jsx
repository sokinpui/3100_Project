// src/modules/DynamicDashboard/widgets/AccountBalanceWidget.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, CircularProgress, List, ListItem, ListItemText, Divider } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import axios from 'axios';
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';
import { format, parseISO, isValid } from 'date-fns';

const API_URL = 'http://localhost:8000';

export default function AccountBalanceWidget({ userId, expenses, timePeriod }) { // Pass expenses and timePeriod
    const { t } = useTranslation();
    const [accounts, setAccounts] = useState([]);
    const [income, setIncome] = useState([]); // Need income too
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;
            setIsLoading(true);
            setError(null);
            try {
                // Fetch accounts and income in parallel
                const [accResponse, incResponse] = await Promise.all([
                    axios.get(`${API_URL}/accounts/${userId}`),
                    axios.get(`${API_URL}/income/${userId}`) // Fetch income
                ]);
                setAccounts(accResponse.data || []);
                setIncome(incResponse.data || []);
            } catch (err) {
                console.error("Error fetching account/income data:", err);
                setError(t('dynamicDashboard.fetchError'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [userId, t]);

    // Calculate estimated current balance for each account
    const accountBalances = useMemo(() => {
        return accounts.map(acc => {
            let currentBalance = parseFloat(acc.starting_balance) || 0;
            const balanceDate = parseISO(acc.balance_date);

            if (!isValid(balanceDate)) return { ...acc, currentBalance: currentBalance }; // Skip if date invalid

            // Filter income relevant to this account *after* the balance date
            const relevantIncome = income.filter(inc =>
                inc.account_id === acc.id &&
                isValid(parseISO(inc.date)) &&
                parseISO(inc.date) >= balanceDate
            );

            // Filter expenses relevant to this account *after* the balance date
            // Use the 'expenses' prop passed down, which is already time-period filtered
            const relevantExpenses = expenses.filter(exp =>
                exp.account_id === acc.id && // Assumes expenses have account_id
                isValid(parseISO(exp.date)) &&
                parseISO(exp.date) >= balanceDate
            );

            // Calculate change since balance date
            const incomeSince = relevantIncome.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
            const expensesSince = relevantExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

            currentBalance += incomeSince - expensesSince;

            return { ...acc, currentBalance };
        });
    }, [accounts, income, expenses]); // Depends on fetched accounts, income, and filtered expenses


    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress size={30} /></Box>;
    }
    if (error) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 1, textAlign: 'center' }}><Typography color="error" variant="caption">{error}</Typography></Box>;
    }
    if (accounts.length === 0) {
        return (
             <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', p: 2, textAlign: 'center' }}>
                <AccountBalanceWalletIcon color="disabled" sx={{ fontSize: 30, mb: 1 }} />
                <Typography color="text.secondary" variant="body2">
                    <T>dynamicDashboard.noAccountsSetup</T> {/* Add new translation key */}
                </Typography>
            </Box>
        );
    }

    return (
         <List dense sx={{ height: '100%', overflowY: 'auto', p: 0 }}>
            {accountBalances.map((acc, index) => (
                <React.Fragment key={acc.id}>
                    <ListItem sx={{ py: 1 }}>
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" fontWeight={500}>{acc.name}</Typography>
                                    <Typography variant="body2" fontWeight="bold">${acc.currentBalance.toFixed(2)}</Typography>
                                </Box>
                            }
                            secondary={
                                <Typography variant="caption" color="text.secondary">
                                    {acc.account_type}
                                    {/* Optionally show start balance: | Start: ${parseFloat(acc.starting_balance).toFixed(2)} on {format(parseISO(acc.balance_date), 'P')} */}
                                </Typography>
                            }
                        />
                    </ListItem>
                    {index < accountBalances.length - 1 && <Divider component="li" />}
                </React.Fragment>
            ))}
        </List>
    );
}

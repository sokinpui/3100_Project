// src/modules/DynamicDashboard/widgets/AccountDetailWidget.jsx
import React, { useState, useMemo, useEffect } from 'react';
import {
    Box, Typography, CircularProgress, Paper, FormControl, InputLabel,
    Select, MenuItem, List, ListItem, ListItemText, Divider
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';
import { format, parseISO, isValid } from 'date-fns'; // For date formatting

// Helper function
function formatCurrency(value) {
    const num = parseFloat(value);
    return isNaN(num) ? '-' : `$${num.toFixed(2)}`;
}

export default function AccountDetailWidget({ accounts = [], income = [], expenses = [], isLoading }) {
    const { t } = useTranslation();
    const [selectedAccountId, setSelectedAccountId] = useState('');

    // Select first account by default when accounts load
    useEffect(() => {
        if (!selectedAccountId && accounts.length > 0) {
            setSelectedAccountId(accounts[0].id);
        }
    }, [accounts, selectedAccountId]);

    const selectedAccount = useMemo(() => {
        return accounts.find(acc => acc.id === selectedAccountId);
    }, [selectedAccountId, accounts]);

    // Calculate details for the selected account based on filtered income/expenses
    const accountDetails = useMemo(() => {
        if (!selectedAccount || isLoading) {
            return { currentBalance: 0, periodIncome: 0, periodExpenses: 0, periodNetFlow: 0 };
        }

        const startingBalance = parseFloat(selectedAccount.starting_balance) || 0;
        const balanceDate = parseISO(selectedAccount.balance_date);

        // Filter income/expenses specifically for *this account* AND *after* its balance date
        // Note: We are using the already time-period-filtered income/expenses passed as props.
        const relevantIncome = income.filter(inc =>
            inc.account_id === selectedAccount.id &&
            isValid(parseISO(inc.date)) &&
            (!isValid(balanceDate) || parseISO(inc.date) >= balanceDate) // Include if balance date invalid or after balance date
        );
        const relevantExpenses = expenses.filter(exp =>
            exp.account_id === selectedAccount.id &&
            isValid(parseISO(exp.date)) &&
            (!isValid(balanceDate) || parseISO(exp.date) >= balanceDate)
        );

        const incomeSinceBalanceDate = relevantIncome.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
        const expensesSinceBalanceDate = relevantExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

        // Estimated Current Balance calculation (same as AccountBalanceWidget)
        const calculatedBalance = startingBalance + incomeSinceBalanceDate - expensesSinceBalanceDate;

        // Calculate totals *only within the dashboard's selected time period* for this account
        const periodIncomeTotal = income
            .filter(inc => inc.account_id === selectedAccount.id)
            .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
        const periodExpensesTotal = expenses
            .filter(exp => exp.account_id === selectedAccount.id)
            .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        const periodNet = periodIncomeTotal - periodExpensesTotal;


        return {
            currentBalance: calculatedBalance,
            periodIncome: periodIncomeTotal,
            periodExpenses: periodExpensesTotal,
            periodNetFlow: periodNet,
        };

    }, [selectedAccount, income, expenses, isLoading]);

    const handleAccountChange = (event) => {
        setSelectedAccountId(event.target.value);
    };

    if (isLoading && accounts.length === 0) { // Show loading only if accounts aren't loaded yet
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress size={30}/></Box>;
    }

    if (accounts.length === 0) {
         return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 2, textAlign: 'center' }}><Typography color="text.secondary"><T>dynamicDashboard.noAccountsSetup</T></Typography></Box>;
    }

    return (
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                {/* Add translation key */}
                <InputLabel id="account-detail-select-label"><T>dynamicDashboard.selectAccount</T></InputLabel>
                <Select
                    labelId="account-detail-select-label"
                    value={selectedAccountId}
                    label={t('dynamicDashboard.selectAccount')}
                    onChange={handleAccountChange}
                >
                    {accounts.map((acc) => (
                        <MenuItem key={acc.id} value={acc.id}>
                            {acc.name} ({acc.account_type})
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {selectedAccount && !isLoading ? ( // Check isLoading here too
                <Paper variant='outlined' sx={{ p: 1.5, flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccountBalanceWalletIcon sx={{ mr: 1, color: 'primary.main' }}/>
                        {selectedAccount.name}
                        <Typography variant="caption" color="text.secondary" sx={{ml: 1}}>({selectedAccount.account_type})</Typography>
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <List dense>
                        <ListItem disableGutters>
                             {/* Add translation key */}
                            <ListItemText primary={<T>dynamicDashboard.currentBalanceEst</T>} />
                            <Typography variant="body1" fontWeight="bold">{formatCurrency(accountDetails.currentBalance)}</Typography>
                        </ListItem>
                        <Divider component="li" light />
                         <ListItem disableGutters>
                             {/* Add translation key */}
                            <ListItemText primary={<T>dynamicDashboard.periodIncome</T>} />
                            <Typography variant="body2" sx={{color: 'success.main'}}>+{formatCurrency(accountDetails.periodIncome)}</Typography>
                        </ListItem>
                         <ListItem disableGutters>
                             {/* Add translation key */}
                            <ListItemText primary={<T>dynamicDashboard.periodExpenses</T>} />
                            <Typography variant="body2" sx={{color: 'error.main'}}>-{formatCurrency(accountDetails.periodExpenses)}</Typography>
                        </ListItem>
                         <ListItem disableGutters>
                             {/* Add translation key */}
                            <ListItemText primary={<T>dynamicDashboard.periodNetFlow</T>} />
                            <Typography variant="body2" fontWeight="medium" sx={{color: accountDetails.periodNetFlow >=0 ? 'success.main' : 'error.main'}}>
                                {accountDetails.periodNetFlow >= 0 ? '+' : '-'}{formatCurrency(Math.abs(accountDetails.periodNetFlow))}
                            </Typography>
                        </ListItem>
                    </List>
                     {/* Optional: Add recent transactions for this account here */}
                </Paper>
            ) : (
                 <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                    <CircularProgress size={24}/>
                 </Box>
            )}
        </Box>
    );
}

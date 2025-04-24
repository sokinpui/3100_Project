// src/modules/AccountManager/components/AccountForm.jsx
import React from 'react';
import {
    Card, CardHeader, CardContent, Grid, TextField, Button,
    InputAdornment, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import {
    AccountBalanceWallet as AccountBalanceWalletIcon,
    AddCircleOutline as AddCircleOutlineIcon,
    AttachMoney as AttachMoneyIcon,
    CalendarToday as CalendarTodayIcon,
    // AccountBalance as AccountBalanceIcon, // Not used here
    TextFields as TextFieldsIcon // For Name
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next'; // Keep useTranslation

// Define account types with translation keys
const ACCOUNT_TYPE_OPTIONS = [
    { value: 'Checking', translationKey: 'checking' },
    { value: 'Savings', translationKey: 'savings' },
    { value: 'Credit Card', translationKey: 'creditCard' },
    { value: 'Cash', translationKey: 'cash' },
    { value: 'Investment', translationKey: 'investment' },
    { value: 'Loan', translationKey: 'loan' },
    { value: 'Other', translationKey: 'other' },
];


export default function AccountForm({ formData, handleChange, handleDateChange, handleSubmit, isSubmitting }) {
    const { t } = useTranslation(); // Get t function

    // Helper to get translated name for renderValue
    const getTranslatedAccountType = (value) => {
        const option = ACCOUNT_TYPE_OPTIONS.find(opt => opt.value === value);
        if (option) {
            return t(`accountManager.accountType_${option.translationKey}`);
        }
        return value; // Fallback to the raw value if not found
    };


    return (
        <Card elevation={3} sx={{ mb: 4, borderRadius: 2 }}>
            <CardHeader title={<T>accountManager.addTitle</T>} sx={{ backgroundColor: 'secondary.light', color: 'secondary.contrastText', py: 1.5 }} />
            <CardContent>
                <form onSubmit={handleSubmit} noValidate>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Grid container spacing={3}>
                            {/* Account Name */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    required
                                    label={<T>accountManager.accountName</T>}
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><TextFieldsIcon fontSize="small" /></InputAdornment>,
                                    }}
                                />
                            </Grid>
                            {/* Account Type */}
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel id="account-type-label"><T>accountManager.accountType</T></InputLabel>
                                    <Select
                                        labelId="account-type-label"
                                        name="account_type"
                                        value={formData.account_type}
                                        onChange={handleChange}
                                        label={<T>accountManager.accountType</T>}
                                        disabled={isSubmitting}
                                        // Add renderValue to show translated selected value
                                        renderValue={(selectedValue) => getTranslatedAccountType(selectedValue)}
                                    >
                                        {/* Iterate over ACCOUNT_TYPE_OPTIONS */}
                                        {ACCOUNT_TYPE_OPTIONS.map(option => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {/* Use t() with dynamic key */}
                                                {t(`accountManager.accountType_${option.translationKey}`)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                             {/* Starting Balance */}
                             <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    required
                                    label={<T>accountManager.startingBalance</T>}
                                    name="starting_balance"
                                    value={formData.starting_balance}
                                    onChange={handleChange}
                                    type="number"
                                    disabled={isSubmitting}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><AttachMoneyIcon fontSize="small" /></InputAdornment>,
                                        inputProps: { step: "0.01" } // Allow cents
                                    }}
                                />
                            </Grid>
                            {/* Balance Date */}
                             <Grid item xs={12} sm={6}>
                                 <DatePicker
                                    label={<T>accountManager.balanceDate</T>}
                                    value={formData.balance_date}
                                    // Ensure you pass the correct handler from the parent
                                    onChange={(newValue) => handleDateChange(newValue)} // Pass only the value
                                    format="YYYY-MM-DD"
                                    disableFuture
                                    disabled={isSubmitting}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            required: true,
                                        },
                                         inputAdornment: {
                                            position: 'start',
                                            children: <CalendarTodayIcon fontSize="small" />,
                                        },
                                    }}
                                />
                            </Grid>
                            {/* Currency - Can add later if needed */}
                            {/* Submit Button */}
                             <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={isSubmitting}
                                    startIcon={<AddCircleOutlineIcon />}
                                >
                                    <T>accountManager.addButton</T>
                                </Button>
                            </Grid>
                        </Grid>
                    </LocalizationProvider>
                </form>
            </CardContent>
        </Card>
    );
}

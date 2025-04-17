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
    AccountBalance as AccountBalanceIcon, // For Type
    TextFields as TextFieldsIcon // For Name
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';

// Define account types - could be moved to constants.js
const ACCOUNT_TYPES = ['Checking', 'Savings', 'Credit Card', 'Cash', 'Investment', 'Loan', 'Other'];

export default function AccountForm({ formData, handleChange, handleDateChange, handleSubmit, isSubmitting }) {
    const { t } = useTranslation();

    return (
        <Card elevation={3} sx={{ mb: 4, borderRadius: 2 }}>
            <CardHeader title={<T>accountManager.addTitle</T>} sx={{ backgroundColor: 'secondary.light', color: 'secondary.contrastText', py: 1.5 }} />
            <CardContent>
                <form onSubmit={handleSubmit} noValidate>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Grid container spacing={3}>
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
                                    >
                                        {ACCOUNT_TYPES.map(type => (
                                            <MenuItem key={type} value={type}>{type}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
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
                             <Grid item xs={12} sm={6}>
                                 <DatePicker
                                    label={<T>accountManager.balanceDate</T>}
                                    value={formData.balance_date}
                                    onChange={handleDateChange}
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

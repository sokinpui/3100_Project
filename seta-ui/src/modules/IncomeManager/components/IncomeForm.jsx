import React from 'react';
import {
    Card, CardHeader, CardContent, Grid, TextField, Button,
    InputAdornment, Select, MenuItem, FormControl, InputLabel, Autocomplete
} from '@mui/material';
import {
    AddCircleOutline as AddCircleOutlineIcon,
    AttachMoney as AttachMoneyIcon,
    CalendarToday as CalendarTodayIcon,
    Source as SourceIcon, // Icon for Source
    AccountBalanceWallet as AccountBalanceWalletIcon, // Icon for Account
    Description as DescriptionIcon
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';

export default function IncomeForm({
    formData,
    accounts,
    isFetchingAccounts,
    handleChange,
    handleDateChange,
    handleSubmit,
    isSubmitting
}) {
    const { t } = useTranslation();

    return (
        <Card elevation={3} sx={{ mb: 4, borderRadius: 2 }}>
            <CardHeader title={<T>incomeManager.addTitle</T>} sx={{ backgroundColor: 'success.light', color: 'success.contrastText', py: 1.5 }} />
            <CardContent>
                <form onSubmit={handleSubmit} noValidate>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Grid container spacing={3}>
                             <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    required
                                    label={<T>incomeManager.amount</T>}
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    type="number"
                                    disabled={isSubmitting}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><AttachMoneyIcon fontSize="small" /></InputAdornment>,
                                        inputProps: { step: "0.01", min: "0" }
                                    }}
                                />
                            </Grid>
                             <Grid item xs={12} sm={6} md={4}>
                                 <DatePicker
                                    label={<T>incomeManager.date</T>}
                                    value={formData.date}
                                    onChange={handleDateChange}
                                    format="YYYY-MM-DD"
                                    disableFuture
                                    disabled={isSubmitting}
                                    slotProps={{
                                        textField: { fullWidth: true, required: true },
                                        inputAdornment: { position: 'start', children: <CalendarTodayIcon fontSize="small" /> },
                                    }}
                                />
                            </Grid>
                             <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    required
                                    label={<T>incomeManager.source</T>}
                                    name="source"
                                    value={formData.source}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><SourceIcon fontSize="small" /></InputAdornment>,
                                    }}
                                />
                            </Grid>
                             <Grid item xs={12} sm={6} md={8}>
                                <TextField
                                    fullWidth
                                    label={<T>incomeManager.descriptionOptional</T>}
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                     multiline
                                     rows={1} // Keep it smaller initially
                                     InputProps={{
                                        startAdornment: <InputAdornment position="start"><DescriptionIcon fontSize="small" /></InputAdornment>,
                                    }}
                                />
                            </Grid>
                             <Grid item xs={12} sm={6} md={4}>
                                 <FormControl fullWidth>
                                     <InputLabel id="account-select-label"><T>incomeManager.accountOptional</T></InputLabel>
                                     <Select
                                         labelId="account-select-label"
                                         name="account_id"
                                         value={formData.account_id}
                                         onChange={handleChange}
                                         label={<T>incomeManager.accountOptional</T>}
                                         disabled={isSubmitting || isFetchingAccounts}
                                     >
                                         <MenuItem value=""><em>None</em></MenuItem>
                                         {accounts.map((acc) => (
                                             <MenuItem key={acc.id} value={acc.id}>
                                                 {acc.name} ({acc.account_type})
                                             </MenuItem>
                                         ))}
                                     </Select>
                                 </FormControl>
                             </Grid>

                             <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="success" // Use success color for income
                                    disabled={isSubmitting}
                                    startIcon={<AddCircleOutlineIcon />}
                                >
                                    <T>incomeManager.addButton</T>
                                </Button>
                            </Grid>
                        </Grid>
                    </LocalizationProvider>
                </form>
            </CardContent>
        </Card>
    );
}

import React from 'react';
import {
    Card, CardHeader, CardContent, Grid, TextField, Button,
    InputAdornment, Select, MenuItem, FormControl, InputLabel, Autocomplete, Box, Typography
} from '@mui/material';
import {
    AddCircleOutline as AddCircleOutlineIcon,
    AttachMoney as AttachMoneyIcon,
    CalendarToday as CalendarTodayIcon,
    Category as CategoryIcon,
    EventRepeat as EventRepeatIcon, // Icon for Frequency
    TextFields as TextFieldsIcon, // Icon for Name
    AccountBalanceWallet as AccountBalanceWalletIcon,
    Description as DescriptionIcon
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';
import { expenseCategories } from '../../../constants'; // Import expense categories

export default function RecurringForm({
    formData,
    accounts,
    isFetchingAccounts,
    frequencyOptions,
    handleChange,
    handleDateChange,
    handleSubmit,
    isSubmitting
}) {
    const { t } = useTranslation();

    const getTranslatedCategory = (name) => {
        const details = expenseCategories.find(cat => cat.name === name);
        const key = details ? `expenseManager.category_${details.key}` : 'expenseManager.category_unknown';
        return t(key, { defaultValue: name });
     }

    return (
        <Card elevation={3} sx={{ mb: 4, borderRadius: 2 }}>
            <CardHeader title={<T>recurringManager.addTitle</T>} sx={{ backgroundColor: 'info.light', color: 'info.contrastText', py: 1.5 }} />
            <CardContent>
                <form onSubmit={handleSubmit} noValidate>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Grid container spacing={3}>
                             {/* Row 1 */}
                             <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    required
                                    label={<T>recurringManager.name</T>}
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><TextFieldsIcon fontSize="small" /></InputAdornment> }}
                                />
                            </Grid>
                             <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    required
                                    label={<T>recurringManager.amount</T>}
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
                                <FormControl fullWidth required>
                                    <InputLabel id="category-label"><T>expenseManager.category</T></InputLabel>
                                    <Select
                                        labelId="category-label"
                                        name="category_name"
                                        value={formData.category_name}
                                        onChange={handleChange}
                                        label={<T>expenseManager.category</T>}
                                        disabled={isSubmitting}
                                        renderValue={(selectedValue) => getTranslatedCategory(selectedValue)}
                                    >
                                        {expenseCategories
                                            .filter(cat => cat.name !== 'Others (Specify)') // Exclude 'Specify' for recurring
                                            .map(({ name, key, icon: Icon }) => (
                                            <MenuItem key={name} value={name}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Icon fontSize="small" sx={{ mr: 1 }} />
                                                    <Typography variant="inherit">{getTranslatedCategory(name)}</Typography>
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Row 2 */}
                            <Grid item xs={12} sm={6} md={4}>
                                 <FormControl fullWidth required>
                                    <InputLabel id="frequency-label"><T>recurringManager.frequency</T></InputLabel>
                                    <Select
                                        labelId="frequency-label"
                                        name="frequency"
                                        value={formData.frequency}
                                        onChange={handleChange}
                                        label={<T>recurringManager.frequency</T>}
                                        disabled={isSubmitting}
                                    >
                                        {frequencyOptions.map(freq => (
                                            <MenuItem key={freq} value={freq}>
                                                <T>{`recurringManager.frequency_${freq}`}</T> {/* Translate frequency */}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                 <DatePicker
                                    label={<T>recurringManager.startDate</T>}
                                    value={formData.start_date}
                                    onChange={(newValue) => handleDateChange('start_date', newValue)} // Pass name
                                    format="YYYY-MM-DD"
                                    disabled={isSubmitting}
                                    slotProps={{
                                        textField: { fullWidth: true, required: true },
                                        inputAdornment: { position: 'start', children: <CalendarTodayIcon fontSize="small" /> },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <DatePicker
                                    label={<T>recurringManager.endDateOptional</T>}
                                    value={formData.end_date}
                                    onChange={(newValue) => handleDateChange('end_date', newValue)} // Pass name
                                    format="YYYY-MM-DD"
                                    disabled={isSubmitting}
                                    minDate={formData.start_date || undefined} // End date must be after start date
                                    slotProps={{
                                        textField: { fullWidth: true },
                                        inputAdornment: { position: 'start', children: <CalendarTodayIcon fontSize="small" /> },
                                    }}
                                    clearable // Allow clearing the end date
                                />
                            </Grid>

                            {/* Row 3 */}
                             <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={<T>recurringManager.descriptionOptional</T>}
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    multiline
                                    rows={1}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><DescriptionIcon fontSize="small" /></InputAdornment> }}
                                />
                            </Grid>
                             <Grid item xs={12} sm={6}>
                                 <FormControl fullWidth>
                                     <InputLabel id="rec-account-select-label"><T>recurringManager.accountOptional</T></InputLabel>
                                     <Select
                                         labelId="rec-account-select-label"
                                         name="account_id"
                                         value={formData.account_id}
                                         onChange={handleChange}
                                         label={<T>recurringManager.accountOptional</T>}
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
                                    color="info" // Use info color
                                    disabled={isSubmitting}
                                    startIcon={<AddCircleOutlineIcon />}
                                >
                                    <T>recurringManager.addButton</T>
                                </Button>
                            </Grid>
                        </Grid>
                    </LocalizationProvider>
                </form>
            </CardContent>
        </Card>
    );
}

import React, { useState } from 'react';
import {
    Card, CardHeader, CardContent, Grid, TextField, Button,
    InputAdornment, Select, MenuItem, FormControl, InputLabel, Box, Typography
} from '@mui/material';
import {
    AddCircleOutline as AddCircleOutlineIcon,
    AttachMoney as AttachMoneyIcon,
    CalendarToday as CalendarTodayIcon,
    Category as CategoryIcon,
    EventRepeat as EventRepeatIcon, // Use for Period
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';
import { expenseCategories } from '../../../constants'; // Import expense categories
import dayjs from 'dayjs';

// Define budget periods (can be moved to constants)
const BUDGET_PERIODS = ['monthly', 'quarterly', 'yearly'];

export default function BudgetForm({ onSubmit, isSubmitting }) {
    const { t } = useTranslation();
    const userId = localStorage.getItem('userId');
    const [formData, setFormData] = useState({
        category_name: '',
        amount_limit: '',
        period: 'monthly', // Default period
        start_date: dayjs(), // Default start date
        end_date: null,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

     const handleDateChange = (name, newValue) => {
        setFormData(prev => ({ ...prev, [name]: newValue }));
    };

     const resetForm = () => {
         setFormData({
            category_name: '',
            amount_limit: '',
            period: 'monthly',
            start_date: dayjs(),
            end_date: null,
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.category_name || !formData.amount_limit || !formData.period || !formData.start_date) {
             // Use specific translation key
             alert(t('budgetManager.fillRequired')); // Simple alert for now
             return;
        }
        const budgetData = {
            ...formData,
            user_id: parseInt(userId),
            amount_limit: parseFloat(formData.amount_limit) || 0,
            start_date: formData.start_date ? formData.start_date.format('YYYY-MM-DD') : null,
            end_date: formData.end_date ? formData.end_date.format('YYYY-MM-DD') : null,
        };

        const success = await onSubmit(budgetData); // Call parent onSubmit
        if (success) {
            resetForm();
        }
    };

     const getTranslatedCategory = (name) => {
        const details = expenseCategories.find(cat => cat.name === name);
        const key = details ? `expenseManager.category_${details.key}` : 'expenseManager.category_unknown';
        return t(key, { defaultValue: name });
     }

    return (
         <Card elevation={3} sx={{ mb: 4, borderRadius: 2 }}>
            <CardHeader title={<T>budgetManager.addTitle</T>} sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText', py: 1.5 }} />
            <CardContent>
                <form onSubmit={handleSubmit} noValidate>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Grid container spacing={3}>
                             <Grid item xs={12} sm={6} md={4}>
                                <FormControl fullWidth required>
                                    <InputLabel id="budget-category-label"><T>expenseManager.category</T></InputLabel>
                                    <Select
                                        labelId="budget-category-label"
                                        name="category_name"
                                        value={formData.category_name}
                                        onChange={handleChange}
                                        label={<T>expenseManager.category</T>}
                                        disabled={isSubmitting}
                                        renderValue={(selectedValue) => getTranslatedCategory(selectedValue)}
                                    >
                                        {/* TODO: Add an "Overall" option? */}
                                        {expenseCategories
                                            .filter(cat => cat.name !== 'Others (Specify)')
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
                             <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    required
                                    label={<T>budgetManager.amountLimit</T>}
                                    name="amount_limit"
                                    value={formData.amount_limit}
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
                                    <InputLabel id="budget-period-label"><T>budgetManager.period</T></InputLabel>
                                    <Select
                                        labelId="budget-period-label"
                                        name="period"
                                        value={formData.period}
                                        onChange={handleChange}
                                        label={<T>budgetManager.period</T>}
                                        disabled={isSubmitting}
                                    >
                                        {BUDGET_PERIODS.map(p => (
                                            <MenuItem key={p} value={p}>
                                                <T>{`recurringManager.frequency_${p}`}</T> {/* Reuse frequency keys */}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                 <DatePicker
                                    label={<T>budgetManager.startDate</T>}
                                    value={formData.start_date}
                                    onChange={(newValue) => handleDateChange('start_date', newValue)}
                                    format="YYYY-MM-DD" // Or "YYYY-MM" if period is monthly? Adjust as needed
                                    views={['year', 'month', 'day']} // Allow selecting day
                                    disabled={isSubmitting}
                                    slotProps={{
                                        textField: { fullWidth: true, required: true },
                                        inputAdornment: { position: 'start', children: <CalendarTodayIcon fontSize="small" /> },
                                    }}
                                />
                            </Grid>
                             <Grid item xs={12} sm={6}>
                                <DatePicker
                                    label={<T>budgetManager.endDateOptional</T>}
                                    value={formData.end_date}
                                    onChange={(newValue) => handleDateChange('end_date', newValue)}
                                    format="YYYY-MM-DD"
                                    views={['year', 'month', 'day']}
                                    disabled={isSubmitting}
                                    minDate={formData.start_date || undefined}
                                    slotProps={{
                                        textField: { fullWidth: true },
                                        inputAdornment: { position: 'start', children: <CalendarTodayIcon fontSize="small" /> },
                                    }}
                                    clearable
                                />
                            </Grid>

                             <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={isSubmitting}
                                    startIcon={<AddCircleOutlineIcon />}
                                >
                                    <T>budgetManager.addButton</T>
                                </Button>
                            </Grid>
                        </Grid>
                    </LocalizationProvider>
                </form>
            </CardContent>
        </Card>
    );
}

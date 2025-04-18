// src/modules/DynamicDashboard/widgets/QuickAddWidget.jsx
import React, { useState } from 'react';
import {
    Box, TextField, Button, Tabs, Tab, FormControl, InputLabel,
    Select, MenuItem, InputAdornment, CircularProgress, Typography, IconButton
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from 'axios';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CategoryIcon from '@mui/icons-material/Category';
import SourceIcon from '@mui/icons-material/Source'; // For Income Source
import { expenseCategories } from '../../../constants'; // Use defined categories
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';

const API_URL = 'http://localhost:8000';

// Define some common income sources for quick add
const commonIncomeSources = ["Salary", "Freelance", "Bonus", "Gift", "Other"];

export function QuickAddWidget({ userId, showNotification, onDataAdded }) {
    const { t } = useTranslation();
    const [tabValue, setTabValue] = useState(0); // 0 for Expense, 1 for Income
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        categoryOrSource: '',
        date: dayjs(), // Default to today
        description: '',
    });

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        // Reset form when switching tabs
        setFormData({ amount: '', categoryOrSource: '', date: dayjs(), description: '' });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (newValue) => {
        setFormData(prev => ({ ...prev, date: newValue }));
    };

    const resetForm = () => {
         setFormData({ amount: '', categoryOrSource: '', date: dayjs(), description: '' });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.categoryOrSource || !formData.date) {
            showNotification(t('quickAdd.fillRequired'), 'error'); // Use specific translation key
            return;
        }
        if (parseFloat(formData.amount) <= 0) {
             showNotification(t('quickAdd.amountPositive'), 'error'); // Use specific translation key
             return;
        }

        setIsSubmitting(true);
        const isExpense = tabValue === 0;
        const endpoint = isExpense ? '/expenses' : '/income';
        const payload = {
            user_id: parseInt(userId),
            amount: parseFloat(formData.amount),
            date: formData.date.format('YYYY-MM-DD'),
            description: formData.description || null, // Send null if empty
        };

        if (isExpense) {
            payload.category_name = formData.categoryOrSource;
        } else {
            payload.source = formData.categoryOrSource;
        }

        try {
            await axios.post(`${API_URL}${endpoint}`, payload);
            const successMsg = isExpense ? t('quickAdd.expenseAdded') : t('quickAdd.incomeAdded');
            showNotification(successMsg, 'success');
            resetForm();
            if (onDataAdded) {
                onDataAdded(); // Trigger data refresh in parent
            }
        } catch (error) {
            console.error("Quick Add Error:", error.response?.data || error.message);
            const errorMsg = isExpense ? t('quickAdd.expenseError') : t('quickAdd.incomeError');
            showNotification(error.response?.data?.detail || errorMsg, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentCategories = tabValue === 0
        ? expenseCategories.filter(cat => cat.name !== 'Others (Specify)') // Exclude 'Specify' for quick add
        : commonIncomeSources; // Use predefined common sources

    return (
        <Box sx={{ p: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" sx={{ mb: 2 }}>
                <Tab label={<T>common.Expenses</T>} />
                <Tab label={<T>common.Income</T>} />
            </Tabs>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <TextField
                        label={<T>common.Amount</T>} // Use general key
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        type="number"
                        required
                        fullWidth
                        size="small"
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><AttachMoneyIcon fontSize="small" /></InputAdornment>,
                            inputProps: { step: "0.01", min: "0.01" }
                        }}
                        sx={{ mb: 1.5 }}
                        disabled={isSubmitting}
                    />

                    <FormControl fullWidth required size="small" sx={{ mb: 1.5 }} disabled={isSubmitting}>
                        <InputLabel id="quick-add-category-label">
                            {tabValue === 0 ? <T>expenseManager.category</T> : <T>incomeManager.source</T>}
                        </InputLabel>
                        <Select
                            labelId="quick-add-category-label"
                            name="categoryOrSource"
                            value={formData.categoryOrSource}
                            onChange={handleChange}
                            label={tabValue === 0 ? t('expenseManager.category') : t('incomeManager.source')}
                             startAdornment={ // Add icon inside Select
                                <InputAdornment position="start" sx={{ml: -0.5}}>
                                {tabValue === 0 ? <CategoryIcon fontSize="small" /> : <SourceIcon fontSize="small" />}
                                </InputAdornment>
                            }
                        >
                            {currentCategories.map(item => (
                                <MenuItem key={item.name || item} value={item.name || item}>
                                    {/* If item is object (expense category), display name, else display string (income source) */}
                                    {item.name ? t(`expenseManager.category_${item.key}`, { defaultValue: item.name }) : item}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <DatePicker
                        label={<T>common.Date</T>} // Use general key
                        value={formData.date}
                        onChange={handleDateChange}
                        format="YYYY-MM-DD"
                        disableFuture
                        disabled={isSubmitting}
                        slotProps={{
                            textField: { fullWidth: true, required: true, size: 'small' },
                        }}
                         sx={{ mb: 1.5 }}
                    />

                     <TextField
                        label={<T>common.Description</T>} // Use general key + Optional?
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                        disabled={isSubmitting}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color={tabValue === 0 ? "primary" : "success"}
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <AddCircleOutlineIcon />}
                    >
                        {tabValue === 0 ? <T>quickAdd.addExpense</T> : <T>quickAdd.addIncome</T>}
                    </Button>

                </Box>
            </LocalizationProvider>
        </Box>
    );
}

export default React.memo(QuickAddWidget);

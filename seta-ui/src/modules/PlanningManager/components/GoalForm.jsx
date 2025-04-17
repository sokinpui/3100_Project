import React, { useState } from 'react';
import {
    Card, CardHeader, CardContent, Grid, TextField, Button,
    InputAdornment
} from '@mui/material';
import {
    AddCircleOutline as AddCircleOutlineIcon,
    AttachMoney as AttachMoneyIcon,
    CalendarToday as CalendarTodayIcon,
    TextFields as TextFieldsIcon, // For Name
    Flag as FlagIcon // For Target Amount
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

export default function GoalForm({ onSubmit, isSubmitting }) {
    const { t } = useTranslation();
    const userId = localStorage.getItem('userId');
    const [formData, setFormData] = useState({
        name: '',
        target_amount: '',
        current_amount: '0', // Default current amount to 0
        target_date: null,
    });

     const handleChange = (e) => {
        const { name, value } = e.target;
         // Prevent negative current amount input
        if (name === 'current_amount' && parseFloat(value) < 0) return;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

     const handleDateChange = (newValue) => {
        setFormData(prev => ({ ...prev, target_date: newValue }));
    };

    const resetForm = () => {
         setFormData({
            name: '',
            target_amount: '',
            current_amount: '0',
            target_date: null,
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
         if (!formData.name || !formData.target_amount) {
             alert(t('goalManager.fillRequired'));
             return;
        }
        const goalData = {
            ...formData,
            user_id: parseInt(userId),
            target_amount: parseFloat(formData.target_amount) || 0,
            current_amount: parseFloat(formData.current_amount) || 0,
            target_date: formData.target_date ? formData.target_date.format('YYYY-MM-DD') : null,
        };
         // Basic validation: target amount > 0
        if (goalData.target_amount <= 0) {
            alert(t('goalManager.targetAmountPositive'));
            return;
        }
        // Basic validation: current amount <= target amount
        if (goalData.current_amount > goalData.target_amount) {
            alert(t('goalManager.currentAmountExceedsTarget'));
             return;
        }

        const success = await onSubmit(goalData);
        if (success) {
            resetForm();
        }
    };


    return (
         <Card elevation={3} sx={{ mb: 4, borderRadius: 2 }}>
            <CardHeader title={<T>goalManager.addTitle</T>} sx={{ backgroundColor: 'success.light', color: 'success.contrastText', py: 1.5 }} />
            <CardContent>
                <form onSubmit={handleSubmit} noValidate>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Grid container spacing={3}>
                             <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth required
                                    label={<T>goalManager.goalName</T>}
                                    name="name" value={formData.name} onChange={handleChange} disabled={isSubmitting}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><TextFieldsIcon fontSize="small" /></InputAdornment> }}
                                />
                            </Grid>
                             <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth required
                                    label={<T>goalManager.targetAmount</T>}
                                    name="target_amount" value={formData.target_amount} onChange={handleChange} disabled={isSubmitting}
                                    type="number"
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><FlagIcon fontSize="small" /></InputAdornment>,
                                        inputProps: { step: "0.01", min: "0.01" } // Target must be > 0
                                    }}
                                />
                            </Grid>
                             <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={<T>goalManager.currentAmountOptional</T>}
                                    name="current_amount" value={formData.current_amount} onChange={handleChange} disabled={isSubmitting}
                                    type="number"
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><AttachMoneyIcon fontSize="small" /></InputAdornment>,
                                        inputProps: { step: "0.01", min: "0" }
                                    }}
                                     helperText={<T>goalManager.currentAmountHelper</T>}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DatePicker
                                    label={<T>goalManager.targetDateOptional</T>}
                                    value={formData.target_date}
                                    onChange={handleDateChange}
                                    format="YYYY-MM-DD"
                                    disabled={isSubmitting}
                                    minDate={dayjs().add(1,'day')} // Target date should be in the future
                                    slotProps={{
                                        textField: { fullWidth: true },
                                        inputAdornment: { position: 'start', children: <CalendarTodayIcon fontSize="small" /> },
                                    }}
                                    clearable
                                />
                            </Grid>

                             <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button type="submit" variant="contained" color="success" disabled={isSubmitting} startIcon={<AddCircleOutlineIcon />}>
                                    <T>goalManager.addButton</T>
                                </Button>
                            </Grid>
                        </Grid>
                    </LocalizationProvider>
                </form>
            </CardContent>
        </Card>
    );
}

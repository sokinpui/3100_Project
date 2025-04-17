import React, { useState, useEffect, useCallback } from 'react';
import { Container, CircularProgress, Box, Typography } from '@mui/material';
import axios from 'axios';
import RecurringForm from './components/RecurringForm';
import RecurringList from './components/RecurringList';
import ExpenseNotifications from '../ExpenseManager/components/ExpenseNotifications'; // Reuse notification component
import ConfirmationDialog from '../AccountManager/components/ConfirmationDialog'; // Reuse confirmation dialog
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import T from '../../utils/T'; // Translation component

const API_URL = 'http://localhost:8000';

// Define frequency options based on Enum (adjust keys if needed)
const FREQUENCY_OPTIONS = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];

export default function RecurringManager() {
    const { t } = useTranslation();
    const userId = localStorage.getItem('userId');

    const [recurringList, setRecurringList] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingAccounts, setIsFetchingAccounts] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        category_name: '',
        frequency: 'monthly', // Default frequency
        start_date: dayjs(), // Default to today
        end_date: null,
        description: '',
        account_id: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for delete confirmation
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null); // Store { id: number, name: string }

    const showNotification = (message, severity = 'success') => {
        setNotification({ open: true, message, severity });
    };

    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    // Fetch Recurring Rules
    const fetchRecurring = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/recurring/${userId}`);
            setRecurringList(response.data || []);
        } catch (err) {
            console.error("Fetch recurring error:", err);
            const fetchErrorMsg = t('recurringManager.fetchError');
            setError(fetchErrorMsg);
            showNotification(fetchErrorMsg, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [userId, t]);

    // Fetch Accounts
    const fetchAccounts = useCallback(async () => {
        if (!userId) return;
        setIsFetchingAccounts(true);
        try {
            const response = await axios.get(`${API_URL}/accounts/${userId}`);
            setAccounts(response.data || []);
        } catch (err) {
            console.error("Fetch accounts error:", err);
        } finally {
            setIsFetchingAccounts(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchRecurring();
        fetchAccounts();
    }, [fetchRecurring, fetchAccounts]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Generic date handler
    const handleDateChange = (name, newValue) => {
        setFormData(prev => ({ ...prev, [name]: newValue }));
    };

    const resetForm = () => {
         setFormData({
            name: '',
            amount: '',
            category_name: '',
            frequency: 'monthly',
            start_date: dayjs(),
            end_date: null,
            description: '',
            account_id: ''
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.amount || !formData.category_name || !formData.frequency || !formData.start_date) {
            showNotification(t('recurringManager.fillRequired'), 'error');
            return;
        }
        setIsSubmitting(true);
        setError(null);

        try {
            const recurringData = {
                ...formData,
                user_id: parseInt(userId),
                amount: parseFloat(formData.amount) || 0,
                start_date: formData.start_date ? formData.start_date.format('YYYY-MM-DD') : null,
                end_date: formData.end_date ? formData.end_date.format('YYYY-MM-DD') : null, // Handle optional end date
                account_id: formData.account_id ? parseInt(formData.account_id) : null,
            };

            await axios.post(`${API_URL}/recurring`, recurringData);
            showNotification(t('recurringManager.addSuccess'), 'success');
            resetForm();
            fetchRecurring(); // Refresh list

        } catch (err) {
            console.error("Add recurring error:", err.response?.data || err.message);
            const apiError = err.response?.data?.detail || t('recurringManager.addError');
            setError(apiError);
            showNotification(apiError, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

     // --- Delete Handlers ---
    const handleOpenDeleteDialog = (recItem) => {
        setItemToDelete(recItem);
        setDeleteDialogOpen(true);
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete?.id) return;
        setIsSubmitting(true);

        try {
            await axios.delete(`${API_URL}/recurring/${itemToDelete.id}`);
            showNotification(t('recurringManager.deleteSuccess', { name: itemToDelete.name }), 'success');
            fetchRecurring(); // Refresh the list
            handleCancelDelete(); // Close dialog
        } catch (err) {
            console.error("Delete recurring error:", err.response?.data || err.message);
            const apiError = err.response?.data?.detail || t('recurringManager.deleteError');
            showNotification(apiError, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                <T>recurringManager.title</T>
            </Typography>
            <ExpenseNotifications notification={notification} handleCloseNotification={handleCloseNotification} />

            <RecurringForm
                formData={formData}
                accounts={accounts}
                isFetchingAccounts={isFetchingAccounts}
                frequencyOptions={FREQUENCY_OPTIONS} // Pass options
                handleChange={handleChange}
                handleDateChange={handleDateChange}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />

            {error && !isLoading && (
                <Box sx={{ my: 2 }}>
                     <Typography color="error">{error}</Typography>
                </Box>
            )}

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <RecurringList
                    recurringList={recurringList}
                    accounts={accounts}
                    handleOpenDeleteDialog={handleOpenDeleteDialog}
                    isDeleting={isSubmitting && !!itemToDelete}
                />
            )}

             <ConfirmationDialog
                open={deleteDialogOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title={t('recurringManager.deleteTitle')}
                contentText={t('recurringManager.deleteConfirmText', { name: itemToDelete?.name || 'this item' })}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                isLoading={isSubmitting && !!itemToDelete}
                confirmButtonColor="error"
            />
        </Container>
    );
}

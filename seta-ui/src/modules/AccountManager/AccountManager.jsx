import React, { useState, useEffect, useCallback } from 'react';
import { Container, CircularProgress, Box } from '@mui/material';
import axios from 'axios';
import AccountForm from './components/AccountForm';
import AccountList from './components/AccountList';
import ExpenseNotifications from '../ExpenseManager/components/ExpenseNotifications'; // Reuse notification component
import ConfirmationDialog from './components/ConfirmationDialog'; // Create a generic confirmation dialog
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const API_URL = 'http://localhost:8000';

export default function AccountManager() {
    const { t } = useTranslation();
    const userId = localStorage.getItem('userId');

    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [formData, setFormData] = useState({
        name: '',
        account_type: '',
        starting_balance: '',
        balance_date: null, // Use null for DatePicker
        currency: 'USD' // Default currency
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

    const fetchAccounts = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/accounts/${userId}`);
            setAccounts(response.data || []);
        } catch (err) {
            console.error("Fetch accounts error:", err);
            setError(t('accountManager.fetchError')); // Add translation
            showNotification(t('accountManager.fetchError'), 'error');
        } finally {
            setIsLoading(false);
        }
    }, [userId, t]);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (newValue) => {
        setFormData(prev => ({ ...prev, balance_date: newValue }));
    };

    const resetForm = () => {
         setFormData({
            name: '',
            account_type: '',
            starting_balance: '',
            balance_date: null,
            currency: 'USD'
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.account_type || !formData.balance_date || formData.starting_balance === '') {
            showNotification(t('accountManager.fillRequired'), 'error'); // Add translation
            return;
        }
        setIsSubmitting(true);
        setError(null);

        try {
            const accountData = {
                ...formData,
                user_id: parseInt(userId),
                starting_balance: parseFloat(formData.starting_balance) || 0,
                // Format date correctly for backend (YYYY-MM-DD)
                balance_date: formData.balance_date ? formData.balance_date.format('YYYY-MM-DD') : null,
            };

            await axios.post(`${API_URL}/accounts`, accountData);
            showNotification(t('accountManager.addSuccess'), 'success'); // Add translation
            resetForm();
            fetchAccounts(); // Refresh list

        } catch (err) {
            console.error("Add account error:", err.response?.data || err.message);
            const apiError = err.response?.data?.detail || t('accountManager.addError');
            setError(apiError);
            showNotification(apiError, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

     // --- Delete Handlers ---
    const handleOpenDeleteDialog = (account) => {
        setItemToDelete(account); // Store the whole account object (or just id and name)
        setDeleteDialogOpen(true);
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete?.id) return;
        setIsSubmitting(true); // Reuse submitting state for delete operation indicator

        try {
            await axios.delete(`${API_URL}/accounts/${itemToDelete.id}`);
            showNotification(t('accountManager.deleteSuccess', { name: itemToDelete.name }), 'success'); // Add translation
            fetchAccounts(); // Refresh the list
            handleCancelDelete(); // Close dialog
        } catch (err) {
            console.error("Delete account error:", err.response?.data || err.message);
            const apiError = err.response?.data?.detail || t('accountManager.deleteError');
            showNotification(apiError, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <ExpenseNotifications notification={notification} handleCloseNotification={handleCloseNotification} />

            {/* Maybe add summary cards later if needed */}

            <AccountForm
                formData={formData}
                handleChange={handleChange}
                handleDateChange={handleDateChange}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />

            {error && !isLoading && ( // Show fetch error only if not loading
                <Box sx={{ my: 2 }}>
                     <Typography color="error">{error}</Typography>
                </Box>
            )}

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <AccountList
                    accounts={accounts}
                    handleOpenDeleteDialog={handleOpenDeleteDialog}
                    isDeleting={isSubmitting && !!itemToDelete} // Indicate delete in progress
                />
            )}

             <ConfirmationDialog
                open={deleteDialogOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title={t('accountManager.deleteTitle')} // Add translation
                contentText={t('accountManager.deleteConfirmText', { name: itemToDelete?.name || 'this account' })} // Add translation
                confirmText={t('common.delete')} // Use common translation
                cancelText={t('common.cancel')} // Use common translation
                isLoading={isSubmitting && !!itemToDelete} // Show loading on confirm button
            />
        </Container>
    );
}

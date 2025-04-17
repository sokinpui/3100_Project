// src/modules/AccountManager/AccountManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Container, CircularProgress, Box, Typography } from '@mui/material';
import axios from 'axios';
import AccountForm from './components/AccountForm';
import AccountList from './components/AccountList';
import ExpenseNotifications from '../ExpenseManager/components/ExpenseNotifications'; // Reuse notification component
import ConfirmationDialog from './components/ConfirmationDialog'; // Reuse confirmation dialog
import { useTranslation } from 'react-i18next';
import T from '../../utils/T'; // Import translation component

const API_URL = 'http://localhost:8000';

export default function AccountManager() {
    const { t } = useTranslation();
    const userId = localStorage.getItem('userId');

    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // For initial load
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [formData, setFormData] = useState({
        name: '',
        account_type: '',
        starting_balance: '',
        balance_date: null,
        currency: 'USD'
    });
    const [isSubmitting, setIsSubmitting] = useState(false); // For add/update form

    // State for single delete confirmation
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null); // Store { id: number, name: string }

    // State for bulk delete
    const [selectedAccountIds, setSelectedAccountIds] = useState([]);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false); // Loading state for bulk delete

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
            setError(t('accountManager.fetchError'));
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
            showNotification(t('accountManager.fillRequired'), 'error');
            return;
        }
        setIsSubmitting(true); // Use isSubmitting for add form
        setError(null);

        try {
            const accountData = {
                ...formData,
                user_id: parseInt(userId),
                starting_balance: parseFloat(formData.starting_balance) || 0,
                balance_date: formData.balance_date ? formData.balance_date.format('YYYY-MM-DD') : null,
            };

            await axios.post(`${API_URL}/accounts`, accountData);
            showNotification(t('accountManager.addSuccess'), 'success');
            resetForm();
            fetchAccounts(); // Refresh list

        } catch (err) {
            console.error("Add account error:", err.response?.data || err.message);
            const apiError = err.response?.data?.detail || t('accountManager.addError');
            setError(apiError);
            showNotification(apiError, 'error');
        } finally {
            setIsSubmitting(false); // Reset add form submitting state
        }
    };

     // --- Single Delete Handlers ---
    const handleOpenDeleteDialog = (account) => {
        setItemToDelete(account);
        setDeleteDialogOpen(true);
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setBulkDeleteDialogOpen(false); // Also close bulk delete dialog
        setItemToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete?.id) return;
        // Use isSubmitting for single delete loading state
        setIsSubmitting(true);

        try {
            await axios.delete(`${API_URL}/accounts/${itemToDelete.id}`);
            showNotification(t('accountManager.deleteSuccess', { name: itemToDelete.name }), 'success');
            fetchAccounts(); // Refresh the list
            handleCancelDelete(); // Close dialog
        } catch (err) {
            console.error("Delete account error:", err.response?.data || err.message);
            const apiError = err.response?.data?.detail || t('accountManager.deleteError');
            showNotification(apiError, 'error');
        } finally {
            setIsSubmitting(false); // Reset single delete loading state
        }
    };

    // --- Bulk Delete Handlers ---
    const handleSelectionChange = (newSelection) => {
        setSelectedAccountIds(newSelection);
    };

    const handleBulkDelete = () => { // Triggered by button in AccountList
        if (selectedAccountIds.length === 0) return;
        setBulkDeleteDialogOpen(true); // Open confirmation dialog
    };

    const handleConfirmBulkDelete = async () => {
        setIsBulkDeleting(true); // Set loading true for bulk delete operation
        try {
            // IMPORTANT: Update API endpoint when created
            await axios.post(`${API_URL}/accounts/bulk/delete`, { account_ids: selectedAccountIds });
            // Update state optimistically
            setAccounts(prev => prev.filter(account => !selectedAccountIds.includes(account.id)));
            // TODO: Add specific translation key for bulk delete success
            showNotification(t('accountManager.bulkDeleteSuccess', { count: selectedAccountIds.length }), 'success');
            setSelectedAccountIds([]); // Clear selection
        } catch (error) {
            // TODO: Add specific translation key for bulk delete failure
            showNotification(t('accountManager.bulkDeleteError'), 'error');
            console.error("Bulk delete account error:", error.response?.data || error.message);
        } finally {
            setBulkDeleteDialogOpen(false);
            setIsBulkDeleting(false); // Set loading false
        }
    };

    // --- Determine if any delete operation is in progress ---
    // Use isDeleting in AccountList to disable buttons during either operation
    const isDeleting = (isSubmitting && !!itemToDelete) || isBulkDeleting;


    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom> {/* Add Title */}
                <T>accountManager.title</T>
            </Typography>
            <ExpenseNotifications notification={notification} handleCloseNotification={handleCloseNotification} />

            <AccountForm
                formData={formData}
                handleChange={handleChange}
                handleDateChange={handleDateChange}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting} // Pass add/update submitting state
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
                <AccountList
                    accounts={accounts}
                    handleOpenDeleteDialog={handleOpenDeleteDialog}
                    isDeleting={isDeleting} // Pass combined deleting state
                    // Bulk delete props
                    onSelectionChange={handleSelectionChange}
                    handleBulkDelete={handleBulkDelete}
                    selectedAccountIds={selectedAccountIds}
                />
            )}

             {/* Single Delete Confirmation Dialog */}
             <ConfirmationDialog
                open={deleteDialogOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title={t('accountManager.deleteTitle')}
                contentText={t('accountManager.deleteConfirmText', { name: itemToDelete?.name || 'this account' })}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                isLoading={isSubmitting && !!itemToDelete} // Loading for single delete
                confirmButtonColor="error"
            />

            {/* Bulk Delete Confirmation Dialog */}
             <ConfirmationDialog
                open={bulkDeleteDialogOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmBulkDelete}
                 // TODO: Add specific translation key
                title={t('accountManager.deleteMultipleTitle')}
                 // TODO: Add specific translation key
                contentText={t('accountManager.confirmBulkDeleteAccounts', { count: selectedAccountIds.length })}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                isLoading={isBulkDeleting} // Loading for bulk delete
                confirmButtonColor="error"
            />
        </Container>
    );
}

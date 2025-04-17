// src/modules/RecurringManager/RecurringManager.jsx
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
    const [isSubmitting, setIsSubmitting] = useState(false); // For add/update

    // State for delete confirmation (single)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null); // Store { id: number, name: string }

    // State for bulk delete
    const [selectedRecurringIds, setSelectedRecurringIds] = useState([]);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false); // Loading state for bulk delete

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
                end_date: formData.end_date ? formData.end_date.format('YYYY-MM-DD') : null,
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

     // --- Single Delete Handlers ---
    const handleOpenDeleteDialog = (recItem) => {
        setItemToDelete(recItem);
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
            await axios.delete(`${API_URL}/recurring/${itemToDelete.id}`);
            showNotification(t('recurringManager.deleteSuccess', { name: itemToDelete.name }), 'success');
            fetchRecurring(); // Refresh the list
            handleCancelDelete(); // Close dialog
        } catch (err) {
            console.error("Delete recurring error:", err.response?.data || err.message);
            const apiError = err.response?.data?.detail || t('recurringManager.deleteError');
            showNotification(apiError, 'error');
        } finally {
            setIsSubmitting(false); // Reset single delete loading state
        }
    };

     // --- Bulk Delete Handlers ---
    const handleSelectionChange = (newSelection) => {
        setSelectedRecurringIds(newSelection);
    };

    const handleBulkDelete = () => { // Triggered by button in RecurringList
        if (selectedRecurringIds.length === 0) return;
        setBulkDeleteDialogOpen(true); // Open confirmation dialog
    };

    const handleConfirmBulkDelete = async () => {
        setIsBulkDeleting(true); // Set loading true for bulk delete operation
        try {
            // IMPORTANT: Update API endpoint when created
            await axios.post(`${API_URL}/recurring/bulk/delete`, { recurring_ids: selectedRecurringIds });
            // Update state optimistically
            setRecurringList(prev => prev.filter(item => !selectedRecurringIds.includes(item.id)));
            // TODO: Add specific translation key for bulk delete success
            showNotification(t('recurringManager.bulkDeleteSuccess', { count: selectedRecurringIds.length }), 'success');
            setSelectedRecurringIds([]); // Clear selection
        } catch (error) {
            // TODO: Add specific translation key for bulk delete failure
            showNotification(t('recurringManager.bulkDeleteError'), 'error');
            console.error("Bulk delete recurring error:", error.response?.data || error.message);
        } finally {
            setBulkDeleteDialogOpen(false);
            setIsBulkDeleting(false); // Set loading false
        }
    };

    // --- Determine if any delete operation is in progress ---
    const isDeleting = (isSubmitting && !!itemToDelete) || isBulkDeleting;


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
                <RecurringList
                    recurringList={recurringList}
                    accounts={accounts}
                    handleOpenDeleteDialog={handleOpenDeleteDialog}
                    isDeleting={isDeleting} // Pass combined deleting state
                    // Bulk delete props
                    onSelectionChange={handleSelectionChange}
                    handleBulkDelete={handleBulkDelete}
                    selectedRecurringIds={selectedRecurringIds}
                />
            )}

            {/* Single Delete Confirmation Dialog */}
             <ConfirmationDialog
                open={deleteDialogOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title={t('recurringManager.deleteTitle')}
                contentText={t('recurringManager.deleteConfirmText', { name: itemToDelete?.name || 'this item' })}
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
                title={t('recurringManager.deleteMultipleTitle')}
                 // TODO: Add specific translation key
                contentText={t('recurringManager.confirmBulkDeleteRecurring', { count: selectedRecurringIds.length })}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                isLoading={isBulkDeleting} // Loading for bulk delete
                confirmButtonColor="error"
            />
        </Container>
    );
}

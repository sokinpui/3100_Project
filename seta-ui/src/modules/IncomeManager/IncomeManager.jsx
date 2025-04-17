// src/modules/IncomeManager/IncomeManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Container, CircularProgress, Box, Typography } from '@mui/material';
import axios from 'axios';
import IncomeForm from './components/IncomeForm';
import IncomeList from './components/IncomeList';
import ExpenseNotifications from '../ExpenseManager/components/ExpenseNotifications'; // Reuse notification component
import ConfirmationDialog from '../AccountManager/components/ConfirmationDialog'; // Reuse confirmation dialog
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import T from '../../utils/T';

const API_URL = 'http://localhost:8000';

export default function IncomeManager() {
    const { t } = useTranslation();
    const userId = localStorage.getItem('userId');

    const [incomeList, setIncomeList] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingAccounts, setIsFetchingAccounts] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [formData, setFormData] = useState({
        amount: '',
        date: dayjs(),
        source: '',
        description: '',
        account_id: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false); // For add/update

    // State for delete confirmation (single)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // State for bulk delete
    const [selectedIncomeIds, setSelectedIncomeIds] = useState([]);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false); // Loading state for bulk delete

    const showNotification = (message, severity = 'success') => {
        setNotification({ open: true, message, severity });
    };

    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    // Fetch Income Records
    const fetchIncome = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/income/${userId}`);
            setIncomeList(response.data || []);
        } catch (err) {
            console.error("Fetch income error:", err);
            const fetchErrorMsg = t('incomeManager.fetchError');
            setError(fetchErrorMsg);
            showNotification(fetchErrorMsg, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [userId, t]);

     // Fetch Accounts for Dropdown
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
        fetchIncome();
        fetchAccounts();
    }, [fetchIncome, fetchAccounts]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (newValue) => {
        setFormData(prev => ({ ...prev, date: newValue }));
    };

    const resetForm = () => {
         setFormData({
            amount: '',
            date: dayjs(),
            source: '',
            description: '',
            account_id: ''
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.date || !formData.source) {
            showNotification(t('incomeManager.fillRequired'), 'error');
            return;
        }
        setIsSubmitting(true);
        setError(null);

        try {
            const incomeData = {
                ...formData,
                user_id: parseInt(userId),
                amount: parseFloat(formData.amount) || 0,
                date: formData.date ? formData.date.format('YYYY-MM-DD') : null,
                account_id: formData.account_id ? parseInt(formData.account_id) : null,
            };

            await axios.post(`${API_URL}/income`, incomeData);
            showNotification(t('incomeManager.addSuccess'), 'success');
            resetForm();
            fetchIncome(); // Refresh list

        } catch (err) {
            console.error("Add income error:", err.response?.data || err.message);
            const apiError = err.response?.data?.detail || t('incomeManager.addError');
            setError(apiError);
            showNotification(apiError, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

     // --- Single Delete Handlers ---
    const handleOpenDeleteDialog = (income) => {
        setItemToDelete(income);
        setDeleteDialogOpen(true);
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setBulkDeleteDialogOpen(false); // Also close bulk delete dialog if open
        setItemToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete?.id) return;
        // Use isSubmitting for single delete for now, or add a specific state
        setIsSubmitting(true);

        try {
            await axios.delete(`${API_URL}/income/${itemToDelete.id}`);
            showNotification(t('incomeManager.deleteSuccess', { source: itemToDelete.source, amount: itemToDelete.amount }), 'success');
            fetchIncome(); // Refresh the list
            handleCancelDelete(); // Close dialog
        } catch (err) {
            console.error("Delete income error:", err.response?.data || err.message);
            const apiError = err.response?.data?.detail || t('incomeManager.deleteError');
            showNotification(apiError, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Bulk Delete Handlers ---
    const handleSelectionChange = (newSelection) => {
        setSelectedIncomeIds(newSelection);
    };

    const handleBulkDelete = () => { // Triggered by button in IncomeList
        if (selectedIncomeIds.length === 0) return;
        setBulkDeleteDialogOpen(true); // Open confirmation dialog
    };

    const handleConfirmBulkDelete = async () => {
        setIsBulkDeleting(true); // Set loading true for bulk delete operation
        try {
            // IMPORTANT: Update API endpoint when created
            await axios.post(`${API_URL}/income/bulk/delete`, { income_ids: selectedIncomeIds });
            // Update state optimistically
            setIncomeList(prev => prev.filter(income => !selectedIncomeIds.includes(income.id)));
            // TODO: Add specific translation key for bulk delete success
            showNotification(t('incomeManager.bulkDeleteSuccess', { count: selectedIncomeIds.length }), 'success');
            setSelectedIncomeIds([]); // Clear selection
        } catch (error) {
            // TODO: Add specific translation key for bulk delete failure
            showNotification(t('incomeManager.bulkDeleteError'), 'error');
            console.error("Bulk delete income error:", error.response?.data || error.message);
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
                <T>incomeManager.title</T>
            </Typography>
            <ExpenseNotifications notification={notification} handleCloseNotification={handleCloseNotification} />

            <IncomeForm
                formData={formData}
                accounts={accounts}
                isFetchingAccounts={isFetchingAccounts}
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
                <IncomeList
                    incomeList={incomeList}
                    accounts={accounts}
                    handleOpenDeleteDialog={handleOpenDeleteDialog}
                    isDeleting={isDeleting} // Pass combined deleting state
                    // Bulk delete props
                    onSelectionChange={handleSelectionChange}
                    handleBulkDelete={handleBulkDelete}
                    selectedIncomeIds={selectedIncomeIds}
                />
            )}

            {/* Single Delete Confirmation Dialog */}
            <ConfirmationDialog
                open={deleteDialogOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title={t('incomeManager.deleteTitle')}
                contentText={t('incomeManager.deleteConfirmText', {
                    source: itemToDelete?.source || 'this income record',
                    amount: parseFloat(itemToDelete?.amount || 0).toFixed(2)
                 })}
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
                title={t('incomeManager.deleteMultipleTitle')}
                // TODO: Add specific translation key
                contentText={t('incomeManager.confirmBulkDeleteIncome', { count: selectedIncomeIds.length })}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                isLoading={isBulkDeleting} // Loading for bulk delete
                confirmButtonColor="error"
            />
        </Container>
    );
}

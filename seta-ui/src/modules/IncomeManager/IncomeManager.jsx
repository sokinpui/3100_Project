import React, { useState, useEffect, useCallback } from 'react';
import { Container, CircularProgress, Box, Typography } from '@mui/material'; // Added Typography
import axios from 'axios';
import IncomeForm from './components/IncomeForm';
import IncomeList from './components/IncomeList';
import ExpenseNotifications from '../ExpenseManager/components/ExpenseNotifications'; // Reuse notification component
import ConfirmationDialog from '../AccountManager/components/ConfirmationDialog'; // Reuse confirmation dialog
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs'; // Needed for date handling
import T from '../../utils/T'; // Import translation function

const API_URL = 'http://localhost:8000';

export default function IncomeManager() {
    const { t } = useTranslation();
    const userId = localStorage.getItem('userId');

    const [incomeList, setIncomeList] = useState([]);
    const [accounts, setAccounts] = useState([]); // Fetch accounts for dropdown
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingAccounts, setIsFetchingAccounts] = useState(false); // Separate loading for accounts
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [formData, setFormData] = useState({
        amount: '',
        date: dayjs(), // Default to today
        source: '',
        description: '',
        account_id: '' // Add account_id
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for delete confirmation
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null); // Store { id: number, source: string, amount: number }

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
            const fetchErrorMsg = t('incomeManager.fetchError'); // Translate
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
            // Optionally show a less intrusive error or just log it
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
            date: dayjs(), // Reset to today
            source: '',
            description: '',
            account_id: ''
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.date || !formData.source) {
            showNotification(t('incomeManager.fillRequired'), 'error'); // Add translation
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
                // Handle optional account_id, send null if empty string
                account_id: formData.account_id ? parseInt(formData.account_id) : null,
            };

            await axios.post(`${API_URL}/income`, incomeData);
            showNotification(t('incomeManager.addSuccess'), 'success'); // Add translation
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

     // --- Delete Handlers ---
    const handleOpenDeleteDialog = (income) => {
        setItemToDelete(income); // Store the whole income object
        setDeleteDialogOpen(true);
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete?.id) return;
        // Consider using a specific deleting state if needed, reusing isSubmitting for now
        setIsSubmitting(true);

        try {
            await axios.delete(`${API_URL}/income/${itemToDelete.id}`);
            showNotification(t('incomeManager.deleteSuccess', { source: itemToDelete.source, amount: itemToDelete.amount }), 'success'); // Add translation
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


    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom> {/* Add a Title */}
                <T>incomeManager.title</T>
            </Typography>
            <ExpenseNotifications notification={notification} handleCloseNotification={handleCloseNotification} />

            {/* Maybe add summary cards later */}

            <IncomeForm
                formData={formData}
                accounts={accounts} // Pass accounts to form
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
                    accounts={accounts} // Pass accounts for potential display mapping
                    handleOpenDeleteDialog={handleOpenDeleteDialog}
                    isDeleting={isSubmitting && !!itemToDelete} // Indicate delete in progress
                />
            )}

             <ConfirmationDialog
                open={deleteDialogOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title={t('incomeManager.deleteTitle')} // Add translation
                // Customize confirmation text
                contentText={t('incomeManager.deleteConfirmText', {
                    source: itemToDelete?.source || 'this income record',
                    amount: parseFloat(itemToDelete?.amount || 0).toFixed(2)
                 })}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                isLoading={isSubmitting && !!itemToDelete}
                confirmButtonColor="error" // Use error color for delete confirm
            />
        </Container>
    );
}

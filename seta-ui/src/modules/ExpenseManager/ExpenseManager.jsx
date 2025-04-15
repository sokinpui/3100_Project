import React, { useState, useEffect } from 'react';
import { Container, CircularProgress } from '@mui/material'; // Removed unused Box
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseSummaryCards from './components/ExpenseSummaryCards';
import ExpenseNotifications from './components/ExpenseNotifications';
import ExpenseDialogs from './components/ExpenseDialogs';
import axios from 'axios';
import dayjs from 'dayjs';
// import T from '../../utils/T'; // <-- No longer need T directly here for notifications
import { useTranslation } from 'react-i18next'; // <-- Import useTranslation

const API_URL = 'http://localhost:8000';

export default function ExpenseManager() {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // For initial load / refetch
  const [isSubmitting, setIsSubmitting] = useState(false); // For add/update form
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({ amount: '', category_name: '', date: '', description: '' });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [showOtherCategoryField, setShowOtherCategoryField] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false); // Specific state for bulk delete operation

  const userId = localStorage.getItem('userId');
  const { t } = useTranslation(); // <-- Get the translation function here

  useEffect(() => {
    if (userId) fetchExpenses();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // Add t to dependency array if translations might change based on language switch *during* component lifecycle, otherwise it's often omitted

    const fetchExpenses = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_URL}/expenses/${userId}`);
            setExpenses(response.data);
        } catch (error) {
             // Use t() to get the translated string
            showNotification(t('expenseManager.failedToLoadExpenses'), 'error');
            console.error("Fetch expenses error:", error.response?.data || error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Notification Helper ---
    const showNotification = (message, severity = 'success') => {
        setNotification({ open: true, message, severity });
    };

    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    // --- Form Handling ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'category_name') setShowOtherCategoryField(value === 'Others (Specify)');
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (newValue) => {
        setFormData(prev => ({ ...prev, date: newValue ? dayjs(newValue).format('YYYY-MM-DD') : '' }));
    };

    const handleCustomCategoryChange = (e) => {
        setFormData(prev => ({ ...prev, category_name: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.category_name || !formData.date) {
            // Use t()
            showNotification(t('expenseManager.fillRequiredFields'), 'error');
            return;
        }
        setConfirmDialogOpen(true);
    };

    const handleConfirmAddExpense = async () => {
        setIsSubmitting(true);
        try {
            const expenseData = {
                user_id: parseInt(userId),
                amount: parseFloat(formData.amount),
                category_name: formData.category_name,
                date: formData.date,
                description: formData.description || "",
            };
            const response = await axios.post(`${API_URL}/expenses`, expenseData);
            // Add to list *or* refetch for consistency if sorting/filtering is active
            setExpenses(prev => [...prev, response.data]);
            setFormData({ amount: '', category_name: '', date: '', description: '' });
             // Use t()
            showNotification(t('expenseManager.expenseAddedSuccess'));
            setShowOtherCategoryField(false); // Reset custom category field visibility
        } catch (error) {
             // Use t()
            showNotification(t('expenseManager.failedToAddExpense'), 'error');
            console.error("Add expense error:", error.response?.data || error.message);
        } finally {
            setIsSubmitting(false);
            setConfirmDialogOpen(false);
        }
    };

    // --- Delete Handling ---
    const handleOpenDeleteDialog = (expenseId) => {
        setExpenseToDelete(expenseId);
        setDeleteDialogOpen(true);
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setBulkDeleteDialogOpen(false);
        setExpenseToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!expenseToDelete) return;
        // Consider adding a loading state specific to single delete if needed
        try {
            await axios.delete(`${API_URL}/expenses/${expenseToDelete}`);
            setExpenses(prev => prev.filter(e => e.id !== expenseToDelete));
            // Use t()
            showNotification(t('expenseManager.expenseDeletedSuccess'));
        } catch (error) {
            // Use t()
            showNotification(t('expenseManager.failedToDeleteSingleExpense'), 'error');
            console.error("Delete expense error:", error.response?.data || error.message);
        } finally {
            handleCancelDelete();
        }
    };

    // --- Bulk Delete Handling ---
     const handleSelectionChange = (newSelection) => {
        setSelectedExpenseIds(newSelection);
    };

    const handleBulkDelete = () => { // Triggered by button in ExpenseList
        if (selectedExpenseIds.length === 0) return;
        setBulkDeleteDialogOpen(true); // Open confirmation dialog
    };

    const handleConfirmBulkDelete = async () => {
        setIsBulkDeleting(true); // Set loading true for bulk delete operation
        try {
            await axios.post(`${API_URL}/expenses/bulk/delete`, { expense_ids: selectedExpenseIds });
            // Update state optimistically
            setExpenses(prev => prev.filter(expense => !selectedExpenseIds.includes(expense.id)));
            // Use t() with interpolation
            showNotification(t('expenseManager.bulkDeleteSuccess', { count: selectedExpenseIds.length }));
            setSelectedExpenseIds([]); // Clear selection
        } catch (error) {
            // Use t()
            showNotification(t('expenseManager.failedToDeleteExpenses'), 'error');
            console.error("Bulk delete error:", error.response?.data || error.message);
        } finally {
            setBulkDeleteDialogOpen(false);
            setIsBulkDeleting(false); // Set loading false
        }
    };


    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <ExpenseNotifications notification={notification} handleCloseNotification={handleCloseNotification} />
            <ExpenseSummaryCards expenses={expenses} />
            <ExpenseForm
                formData={formData}
                showOtherCategoryField={showOtherCategoryField}
                handleChange={handleChange}
                handleDateChange={handleDateChange}
                handleSubmit={handleSubmit}
                handleCustomCategoryChange={handleCustomCategoryChange}
                isSubmitting={isSubmitting} // Pass submitting state if form needs disabling
            />
            <ExpenseList
                expenses={expenses}
                isLoading={isLoading} // Pass initial loading state
                isBulkDeleting={isBulkDeleting} // Pass bulk deleting state
                handleOpenDeleteDialog={handleOpenDeleteDialog}
                onSelectionChange={handleSelectionChange}
                handleBulkDelete={handleBulkDelete} // Pass the trigger function
                selectedExpenseIds={selectedExpenseIds}
            />
            <ExpenseDialogs
                confirmDialogOpen={confirmDialogOpen}
                deleteDialogOpen={deleteDialogOpen}
                bulkDeleteDialogOpen={bulkDeleteDialogOpen}
                isSubmitting={isSubmitting} // For add confirmation
                isBulkDeleting={isBulkDeleting} // For bulk delete confirmation
                formData={formData}
                handleCloseConfirm={() => setConfirmDialogOpen(false)}
                handleConfirmAdd={handleConfirmAddExpense}
                handleCancelDelete={handleCancelDelete} // Used by both delete dialogs
                handleConfirmDelete={handleConfirmDelete} // For single delete
                handleConfirmBulkDelete={handleConfirmBulkDelete} // For bulk delete
            />
        </Container>
    );
}

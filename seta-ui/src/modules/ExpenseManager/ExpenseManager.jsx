// src/modules/ExpenseManager/ExpenseManager.jsx
import React, { useState, useEffect } from 'react';
import { Container, CircularProgress } from '@mui/material';
// import ExpenseForm from './components/ExpenseForm'; // Keep these
// import ExpenseList from './components/ExpenseList';
// import ExpenseNotifications from './components/ExpenseNotifications';
// import ExpenseDialogs from './components/ExpenseDialogs';
import axios from 'axios';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import DataSummaryCards from '../common/DataSummaryCards'; // Import the generic one from common

import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseNotifications from './components/ExpenseNotifications';
import ExpenseDialogs from './components/ExpenseDialogs';

const API_URL = 'http://localhost:8000';

export default function ExpenseManager() {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({ amount: '', category_name: '', date: '', description: '' });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [showOtherCategoryField, setShowOtherCategoryField] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const userId = localStorage.getItem('userId');
  const { t } = useTranslation();

    useEffect(() => {
    if (userId) fetchExpenses();
    }, [userId]);

    const fetchExpenses = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_URL}/expenses/${userId}`);
            setExpenses(response.data);
        } catch (error) {
            showNotification(t('expenseManager.failedToLoadExpenses'), 'error');
            console.error("Fetch expenses error:", error.response?.data || error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const showNotification = (message, severity = 'success') => {
        setNotification({ open: true, message, severity });
    };

    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

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
            setExpenses(prev => [...prev, response.data]);
            setFormData({ amount: '', category_name: '', date: '', description: '' });
            showNotification(t('expenseManager.expenseAddedSuccess'));
            setShowOtherCategoryField(false);
        } catch (error) {
            showNotification(t('expenseManager.failedToAddExpense'), 'error');
            console.error("Add expense error:", error.response?.data || error.message);
        } finally {
            setIsSubmitting(false);
            setConfirmDialogOpen(false);
        }
    };

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
        try {
            await axios.delete(`${API_URL}/expenses/${expenseToDelete}`);
            setExpenses(prev => prev.filter(e => e.id !== expenseToDelete));
            showNotification(t('expenseManager.expenseDeletedSuccess'));
        } catch (error) {
            showNotification(t('expenseManager.failedToDeleteSingleExpense'), 'error');
            console.error("Delete expense error:", error.response?.data || error.message);
        } finally {
            handleCancelDelete();
        }
    };

     const handleSelectionChange = (newSelection) => {
        setSelectedExpenseIds(newSelection);
    };

    const handleBulkDelete = () => {
        if (selectedExpenseIds.length === 0) return;
        setBulkDeleteDialogOpen(true);
    };

    const handleConfirmBulkDelete = async () => {
        setIsBulkDeleting(true);
        try {
            await axios.post(`${API_URL}/expenses/bulk/delete`, { expense_ids: selectedExpenseIds });
            setExpenses(prev => prev.filter(expense => !selectedExpenseIds.includes(expense.id)));
            showNotification(t('expenseManager.bulkDeleteSuccess', { count: selectedExpenseIds.length }));
            setSelectedExpenseIds([]);
        } catch (error) {
            showNotification(t('expenseManager.failedToDeleteExpenses'), 'error');
            console.error("Bulk delete error:", error.response?.data || error.message);
        } finally {
            setBulkDeleteDialogOpen(false);
            setIsBulkDeleting(false);
        }
    };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <ExpenseNotifications notification={notification} handleCloseNotification={handleCloseNotification} />

      {/* Replace ExpenseSummaryCards with DataSummaryCards */}
      <DataSummaryCards data={expenses} type="expense" isLoading={isLoading} />

      <ExpenseForm
        formData={formData}
        showOtherCategoryField={showOtherCategoryField}
        handleChange={handleChange}
        handleDateChange={handleDateChange}
        handleSubmit={handleSubmit}
        handleCustomCategoryChange={handleCustomCategoryChange}
        isSubmitting={isSubmitting}
      />
      <ExpenseList
        expenses={expenses}
        isLoading={isLoading}
        isBulkDeleting={isBulkDeleting}
        handleOpenDeleteDialog={handleOpenDeleteDialog}
        onSelectionChange={handleSelectionChange}
        handleBulkDelete={handleBulkDelete}
        selectedExpenseIds={selectedExpenseIds}
      />
      <ExpenseDialogs
        confirmDialogOpen={confirmDialogOpen}
        deleteDialogOpen={deleteDialogOpen}
        bulkDeleteDialogOpen={bulkDeleteDialogOpen}
        isSubmitting={isSubmitting}
        isBulkDeleting={isBulkDeleting}
        formData={formData}
        handleCloseConfirm={() => setConfirmDialogOpen(false)}
        handleConfirmAdd={handleConfirmAddExpense}
        handleCancelDelete={handleCancelDelete}
        handleConfirmDelete={handleConfirmDelete}
        handleConfirmBulkDelete={handleConfirmBulkDelete}
      />
    </Container>
  );
}

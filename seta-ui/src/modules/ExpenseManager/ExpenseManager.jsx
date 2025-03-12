import React, { useState, useEffect } from 'react';
import { Container } from '@mui/material';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseSummaryCards from './components/ExpenseSummaryCards';
import ExpenseNotifications from './components/ExpenseNotifications';
import ExpenseDialogs from './components/ExpenseDialogs';
import axios from 'axios';
import dayjs from 'dayjs';
import T from '../../utils/T';

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

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (userId) fetchExpenses();
  }, [userId]);

    const fetchExpenses = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_URL}/expenses/${userId}`);
            setExpenses(response.data);
        } catch (error) {
            showNotification(<T>failedToLoadExpenses</T>, 'error');
        } finally {
            setIsLoading(false);
        }
    };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category_name') setShowOtherCategoryField(value === 'Others (Specify)');
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (newValue) => {
    setFormData(prev => ({ ...prev, date: newValue ? dayjs(newValue).format('YYYY-MM-DD') : '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category_name || !formData.date) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    setConfirmDialogOpen(true);
  };

  const handleCustomCategoryChange = (e) => {
    setFormData(prev => ({ ...prev, category_name: e.target.value }));
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
      showNotification('Expense deleted successfully');
    } catch (error) {
      showNotification('Failed to delete expense', 'error');
    } finally {
      handleCancelDelete();
    }
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
      showNotification('Expense added successfully!');
    } catch (error) {
      showNotification('Failed to add expense', 'error');
    } finally {
      setIsSubmitting(false);
      setConfirmDialogOpen(false);
      setShowOtherCategoryField(false);
    }
  };

  const handleBulkDelete = async (ids) => {
    console.log("Selected Expense IDs for deletion:", ids);
    setSelectedExpenseIds(ids);
    if (ids.length === 0) return;
    setBulkDeleteDialogOpen(true); // Open confirmation dialog
  };

  const handleConfirmBulkDelete = async () => {
    try {
      await axios.post(`${API_URL}/expenses/bulk/delete`, { expense_ids: selectedExpenseIds });
      setExpenses(prev => prev.filter(expense => !selectedExpenseIds.includes(expense.id)));
      setSelectedExpenseIds([]);
      showNotification(`Successfully deleted ${selectedExpenseIds.length} expense(s)`);
    } catch (error) {
      showNotification('Failed to delete some or all expenses', 'error');
      console.error("Bulk delete error:", error.response?.data);
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  const handleSelectionChange = (newSelection) => {
    setSelectedExpenseIds(newSelection);
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
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
      />
      <ExpenseList
        expenses={expenses}
        isLoading={isLoading}
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

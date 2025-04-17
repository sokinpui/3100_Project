// src/modules/PlanningManager/PlanningManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Box, Tabs, Tab, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';
import BudgetView from './components/BudgetView';
import GoalView from './components/GoalView';
import ExpenseNotifications from '../ExpenseManager/components/ExpenseNotifications'; // Reuse
import ConfirmationDialog from '../AccountManager/components/ConfirmationDialog'; // Reuse
import { useTranslation } from 'react-i18next';
import T from '../../utils/T';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'; // Icon for Budget Tab
import FlagIcon from '@mui/icons-material/Flag'; // Icon for Goal Tab

const API_URL = 'http://localhost:8000';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`planning-tabpanel-${index}`}
            aria-labelledby={`planning-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ pt: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function PlanningManager() {
    const { t } = useTranslation();
    const userId = localStorage.getItem('userId');
    const [activeTab, setActiveTab] = useState(0); // 0 for Budgets, 1 for Goals

    const [budgets, setBudgets] = useState([]);
    const [goals, setGoals] = useState([]);
    const [accounts, setAccounts] = useState([]);

    const [isLoadingBudgets, setIsLoadingBudgets] = useState(false);
    const [isLoadingGoals, setIsLoadingGoals] = useState(false);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    // --- Delete Dialog State (Combined) ---
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Single delete confirmation
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false); // Bulk delete confirmation
    const [itemToDelete, setItemToDelete] = useState(null); // { type: 'budget' | 'goal', id: number, name: string } for single delete
    const [deleteType, setDeleteType] = useState(null); // 'budget' or 'goal' - for bulk dialog context

    // --- Bulk Delete Specific State ---
    const [selectedBudgetIds, setSelectedBudgetIds] = useState([]);
    const [selectedGoalIds, setSelectedGoalIds] = useState([]); // Added for goals
    const [isDeleting, setIsDeleting] = useState(false); // Combined loading state for ANY delete

    const showNotification = (message, severity = 'success') => {
        setNotification({ open: true, message, severity });
    };
    const handleCloseNotification = () => setNotification(prev => ({ ...prev, open: false }));

    // --- Data Fetching ---
    const fetchBudgets = useCallback(async () => {
        if (!userId) return;
        setIsLoadingBudgets(true);
        try {
            const response = await axios.get(`${API_URL}/budgets/${userId}`);
            setBudgets(response.data || []);
        } catch (err) { setError(t('budgetManager.fetchError')); }
        finally { setIsLoadingBudgets(false); }
    }, [userId, t]);

    const fetchGoals = useCallback(async () => {
        if (!userId) return;
        setIsLoadingGoals(true);
        try {
            const response = await axios.get(`${API_URL}/goals/${userId}`);
            setGoals(response.data || []);
        } catch (err) { setError(t('goalManager.fetchError')); }
        finally { setIsLoadingGoals(false); }
    }, [userId, t]);

     const fetchAccounts = useCallback(async () => {
        if (!userId) return;
        setIsLoadingAccounts(true);
        try {
            const response = await axios.get(`${API_URL}/accounts/${userId}`);
            setAccounts(response.data || []);
        } catch (err) { console.error("Fetch accounts error:", err); }
        finally { setIsLoadingAccounts(false); }
    }, [userId]);


    useEffect(() => {
        fetchBudgets();
        fetchGoals();
        fetchAccounts();
    }, [fetchBudgets, fetchGoals, fetchAccounts]);

    // --- CRUD Handlers ---
    const handleAddBudget = async (budgetData) => {
        setIsDeleting(true);
        try {
             await axios.post(`${API_URL}/budgets`, budgetData);
             showNotification(t('budgetManager.addSuccess'), 'success');
             fetchBudgets();
             return true;
        } catch (err) {
             console.error("Add budget error:", err.response?.data || err.message);
             const apiError = err.response?.data?.detail || t('budgetManager.addError');
             showNotification(apiError, 'error');
             return false;
        } finally {
            setIsDeleting(false);
        }
    };

    const handleAddGoal = async (goalData) => {
         setIsDeleting(true);
         try {
             await axios.post(`${API_URL}/goals`, goalData);
             showNotification(t('goalManager.addSuccess'), 'success');
             fetchGoals();
             return true;
        } catch (err) {
             console.error("Add goal error:", err.response?.data || err.message);
             const apiError = err.response?.data?.detail || t('goalManager.addError');
             showNotification(apiError, 'error');
             return false;
        } finally {
             setIsDeleting(false);
        }
    };

    // --- Single Delete ---
    const handleOpenDeleteDialog = (type, item) => {
        setItemToDelete({ type, id: item.id, name: item.category_name || item.name });
        setDeleteDialogOpen(true);
    };

    const handleConfirmSingleDelete = async () => {
        if (!itemToDelete?.id || !itemToDelete?.type) return;
        setIsDeleting(true);
        const { type, id, name } = itemToDelete;
        const url = type === 'budget' ? `${API_URL}/budgets/${id}` : `${API_URL}/goals/${id}`;
        const successMsgKey = type === 'budget' ? 'budgetManager.deleteSuccess' : 'goalManager.deleteSuccess';
        const errorMsgKey = type === 'budget' ? 'budgetManager.deleteError' : 'goalManager.deleteError';

        try {
            await axios.delete(url);
            showNotification(t(successMsgKey, { name }), 'success');
            if (type === 'budget') fetchBudgets(); else fetchGoals();
            handleCancelDelete();
        } catch (err) {
            console.error(`Delete ${type} error:`, err.response?.data || err.message);
            const apiError = err.response?.data?.detail || t(errorMsgKey);
            showNotification(apiError, 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    // --- Budget Bulk Delete ---
     const handleBudgetSelectionChange = (newSelection) => {
        setSelectedBudgetIds(newSelection);
    };

    const handleBulkDeleteBudget = () => {
        if (selectedBudgetIds.length === 0) return;
        setDeleteType('budget');
        setBulkDeleteDialogOpen(true);
    };

    // --- Goal Bulk Delete ---
    const handleGoalSelectionChange = (newSelection) => { // New handler
        setSelectedGoalIds(newSelection);
    };

    const handleBulkDeleteGoal = () => { // New handler
        if (selectedGoalIds.length === 0) return;
        setDeleteType('goal'); // Set context for the dialog
        setBulkDeleteDialogOpen(true);
    };


    // --- Combined Bulk Delete Confirmation ---
    const handleConfirmBulkDelete = async () => {
        setIsDeleting(true);
        let idsToDelete, url, successMsgKey, errorMsgKey, fetchFunction, payloadKey;

        if (deleteType === 'budget') {
            idsToDelete = selectedBudgetIds;
            url = `${API_URL}/budgets/bulk/delete`;
            payloadKey = 'budget_ids'; // Key expected by backend
            successMsgKey = 'budgetManager.bulkDeleteSuccess';
            errorMsgKey = 'budgetManager.bulkDeleteError';
            fetchFunction = fetchBudgets;
        } else if (deleteType === 'goal') {
            idsToDelete = selectedGoalIds;
            url = `${API_URL}/goals/bulk/delete`; // New endpoint
            payloadKey = 'goal_ids'; // Key expected by backend
            successMsgKey = 'goalManager.bulkDeleteSuccess'; // Add this key
            errorMsgKey = 'goalManager.bulkDeleteError';     // Add this key
            fetchFunction = fetchGoals;
        } else {
             setIsDeleting(false);
             handleCancelDelete();
             return; // Should not happen
        }

        try {
            // Send data with the correct key
            await axios.post(url, { [payloadKey]: idsToDelete });
            showNotification(t(successMsgKey, { count: idsToDelete.length }), 'success');
            if (deleteType === 'budget') setSelectedBudgetIds([]);
            if (deleteType === 'goal') setSelectedGoalIds([]); // Clear goal selection
            fetchFunction(); // Refresh the correct list
            handleCancelDelete(); // Close dialog
        } catch (err) {
            console.error(`Bulk delete ${deleteType} error:`, err.response?.data || err.message);
            const apiError = err.response?.data?.detail || t(errorMsgKey);
            showNotification(apiError, 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    // --- Cancel Delete Dialog ---
     const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setBulkDeleteDialogOpen(false);
        setItemToDelete(null);
        setDeleteType(null);
    };

    // --- Tab Handling ---
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        setError(null);
    };

    const isOverallLoading = isLoadingBudgets || isLoadingGoals || isLoadingAccounts;

    // Determine text/title for the currently open dialog
    let dialogTitle = '';
    let dialogContentText = '';
    let dialogConfirmHandler = null;

    if (deleteDialogOpen && itemToDelete) {
        dialogTitle = t(itemToDelete.type === 'budget' ? 'budgetManager.deleteTitle' : 'goalManager.deleteTitle');
        dialogContentText = t(itemToDelete.type === 'budget' ? 'budgetManager.deleteConfirmText' : 'goalManager.deleteConfirmText', { name: itemToDelete.name || 'this item' });
        dialogConfirmHandler = handleConfirmSingleDelete;
    } else if (bulkDeleteDialogOpen) {
        if (deleteType === 'budget') {
            dialogTitle = t('budgetManager.deleteMultipleTitle');
            dialogContentText = t('budgetManager.confirmBulkDeleteBudgets', { count: selectedBudgetIds.length });
            dialogConfirmHandler = handleConfirmBulkDelete;
        } else if (deleteType === 'goal') {
            dialogTitle = t('goalManager.deleteMultipleTitle'); // Add this key
            dialogContentText = t('goalManager.confirmBulkDeleteGoals', { count: selectedGoalIds.length }); // Add this key
            dialogConfirmHandler = handleConfirmBulkDelete;
        }
    }


    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
             <Typography variant="h4" gutterBottom>
                <T>planningManager.title</T>
            </Typography>
             <ExpenseNotifications notification={notification} handleCloseNotification={handleCloseNotification} />

             <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="Planning manager tabs">
                    <Tab icon={<AccountBalanceIcon />} iconPosition="start" label={<T>planningManager.budgetsTab</T>} id="planning-tab-0" aria-controls="planning-tabpanel-0" />
                    <Tab icon={<FlagIcon />} iconPosition="start" label={<T>planningManager.goalsTab</T>} id="planning-tab-1" aria-controls="planning-tabpanel-1" />
                </Tabs>
            </Box>

             {error && (
                <Box sx={{ my: 2 }}>
                     <Typography color="error" align="center">{error}</Typography>
                </Box>
            )}
             {isOverallLoading && (
                 <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                    <CircularProgress />
                </Box>
             )}

            <TabPanel value={activeTab} index={0}>
                {!isOverallLoading && <BudgetView
                    budgets={budgets}
                    accounts={accounts}
                    onAddBudget={handleAddBudget}
                    onDeleteBudget={(item) => handleOpenDeleteDialog('budget', item)}
                    isDeleting={isDeleting}
                    selectedBudgetIds={selectedBudgetIds}
                    onSelectionChange={handleBudgetSelectionChange}
                    onBulkDelete={handleBulkDeleteBudget}
                />}
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
                 {!isOverallLoading && <GoalView
                    goals={goals}
                    accounts={accounts}
                    onAddGoal={handleAddGoal}
                    onDeleteGoal={(item) => handleOpenDeleteDialog('goal', item)}
                    isDeleting={isDeleting}
                    // Add bulk delete props for GoalView
                    selectedGoalIds={selectedGoalIds}
                    onSelectionChange={handleGoalSelectionChange}
                    onBulkDelete={handleBulkDeleteGoal}
                />}
            </TabPanel>

            {/* Combined Confirmation Dialog */}
            <ConfirmationDialog
                open={deleteDialogOpen || bulkDeleteDialogOpen}
                onClose={handleCancelDelete}
                onConfirm={dialogConfirmHandler}
                title={dialogTitle}
                contentText={dialogContentText}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                isLoading={isDeleting}
                confirmButtonColor="error"
            />
        </Container>
    );
}

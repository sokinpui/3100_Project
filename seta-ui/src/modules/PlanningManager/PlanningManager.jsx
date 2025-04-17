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
                <Box sx={{ pt: 3 }}> {/* Add padding top to content */}
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
    const [accounts, setAccounts] = useState([]); // Needed for budget/goal forms potentially

    const [isLoadingBudgets, setIsLoadingBudgets] = useState(false);
    const [isLoadingGoals, setIsLoadingGoals] = useState(false);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

    const [error, setError] = useState(null); // General error display
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    // --- Delete Dialog State ---
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null); // { type: 'budget' | 'goal', id: number, name: string }
    const [isDeleting, setIsDeleting] = useState(false);

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

     const fetchAccounts = useCallback(async () => { // Fetch accounts if needed by forms
        if (!userId) return;
        setIsLoadingAccounts(true);
        try {
            const response = await axios.get(`${API_URL}/accounts/${userId}`);
            setAccounts(response.data || []);
        } catch (err) { console.error("Fetch accounts error:", err); } // Less critical error
        finally { setIsLoadingAccounts(false); }
    }, [userId]);


    useEffect(() => {
        fetchBudgets();
        fetchGoals();
        fetchAccounts();
    }, [fetchBudgets, fetchGoals, fetchAccounts]);

    // --- CRUD Handlers ---
    const handleAddBudget = async (budgetData) => {
        // Logic similar to AccountManager handleSubmit for POST /budgets
        // Requires isSubmitting state if adding directly here
        try {
             await axios.post(`${API_URL}/budgets`, budgetData);
             showNotification(t('budgetManager.addSuccess'), 'success');
             fetchBudgets(); // Refresh
             return true; // Indicate success
        } catch (err) {
             console.error("Add budget error:", err.response?.data || err.message);
             const apiError = err.response?.data?.detail || t('budgetManager.addError');
             showNotification(apiError, 'error');
             return false; // Indicate failure
        }
    };

    const handleAddGoal = async (goalData) => {
         // Logic similar to AccountManager handleSubmit for POST /goals
         try {
             await axios.post(`${API_URL}/goals`, goalData);
             showNotification(t('goalManager.addSuccess'), 'success');
             fetchGoals(); // Refresh
             return true;
        } catch (err) {
             console.error("Add goal error:", err.response?.data || err.message);
             const apiError = err.response?.data?.detail || t('goalManager.addError');
             showNotification(apiError, 'error');
             return false;
        }
    };

    const handleOpenDeleteDialog = (type, item) => {
        setItemToDelete({ type, id: item.id, name: item.category_name || item.name }); // Store type, id, name
        setDeleteDialogOpen(true);
    };

     const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    const handleConfirmDelete = async () => {
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

    // --- Tab Handling ---
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        setError(null); // Clear general errors on tab switch
    };

    const isLoading = isLoadingBudgets || isLoadingGoals || isLoadingAccounts;

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
             {isLoading && (
                 <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                    <CircularProgress />
                </Box>
             )}

            <TabPanel value={activeTab} index={0}>
                {!isLoading && <BudgetView
                    budgets={budgets}
                    accounts={accounts} // Pass accounts if needed by form/list
                    onAddBudget={handleAddBudget}
                    onDeleteBudget={(item) => handleOpenDeleteDialog('budget', item)}
                />}
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
                 {!isLoading && <GoalView
                    goals={goals}
                    accounts={accounts} // Pass accounts if needed
                    onAddGoal={handleAddGoal}
                    onDeleteGoal={(item) => handleOpenDeleteDialog('goal', item)}
                />}
            </TabPanel>

            <ConfirmationDialog
                open={deleteDialogOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title={t(itemToDelete?.type === 'budget' ? 'budgetManager.deleteTitle' : 'goalManager.deleteTitle')}
                contentText={t(itemToDelete?.type === 'budget' ? 'budgetManager.deleteConfirmText' : 'goalManager.deleteConfirmText', { name: itemToDelete?.name || 'this item' })}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                isLoading={isDeleting}
                confirmButtonColor="error"
            />
        </Container>
    );
}

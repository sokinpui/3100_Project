// src/modules/DynamicDashboard/AddWidgetDialog.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    IconButton, Checkbox, Button, Box,
    FormControlLabel, Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
// --- Import Existing Icons ---
import AssessmentIcon from '@mui/icons-material/Assessment';
import PieChartIcon from '@mui/icons-material/PieChart';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import CategoryIcon from '@mui/icons-material/Category';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalculateIcon from '@mui/icons-material/Calculate';
import StackedLineChartIcon from '@mui/icons-material/StackedLineChart';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
// --- Import NEW Icons ---
import EventNoteIcon from '@mui/icons-material/EventNote'; // For Upcoming Bills
import DonutSmallIcon from '@mui/icons-material/DonutSmall'; // For Budget Overview
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'; // For Mini Calendar
import FlagIcon from '@mui/icons-material/Flag'; // For Goal Progress
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'; // For Net Cash Flow
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'; // For Account Balance
// --- End Import Icons ---
import { useTranslation } from 'react-i18next';
import T from '../../utils/T';

// --- Updated AVAILABLE_WIDGETS ---
const AVAILABLE_WIDGETS = [
    // Existing Widgets
    { id: 'overviewSummary', titleKey: 'dynamicDashboard.overviewSummary', icon: <AssessmentIcon /> },
    { id: 'filterWidget', titleKey: 'dynamicDashboard.filterWidgetTitle', icon: <FilterAltIcon /> },
    { id: 'categoryBreakdown', titleKey: 'dynamicDashboard.categoryBreakdown', icon: <PieChartIcon /> },
    { id: 'recentTransactions', titleKey: 'dynamicDashboard.recentTransactions', icon: <ListAltIcon /> },
    { id: 'expenseTrend', titleKey: 'dynamicDashboard.expenseTrend', icon: <ShowChartIcon /> },
    { id: 'monthlyComparison', titleKey: 'dynamicDashboard.monthlyComparison', icon: <BarChartIcon /> },
    { id: 'topSpendingCategories', titleKey: 'dynamicDashboard.topSpendingCategories', icon: <CategoryIcon /> },
    { id: 'largestExpenses', titleKey: 'dynamicDashboard.largestExpenses', icon: <TrendingUpIcon /> },
    { id: 'averageDailySpend', titleKey: 'dynamicDashboard.averageDailySpend', icon: <CalculateIcon /> },
    { id: 'categorySpendingTimeline', titleKey: 'dynamicDashboard.categorySpendingTimeline', icon: <StackedLineChartIcon /> },
    { id: 'spendingGoalTracker', titleKey: 'dynamicDashboard.spendingGoal', icon: <TrackChangesIcon /> },
    // --- NEW Widgets ---
    { id: 'upcomingBills', titleKey: 'dynamicDashboard.upcomingBillsTitle', icon: <EventNoteIcon /> },
    { id: 'budgetOverview', titleKey: 'dynamicDashboard.budgetOverviewTitle', icon: <DonutSmallIcon /> },
    { id: 'miniCalendar', titleKey: 'dynamicDashboard.miniCalendarTitle', icon: <CalendarMonthIcon /> },
    { id: 'goalProgress', titleKey: 'dynamicDashboard.goalProgressTitle', icon: <FlagIcon /> },
    { id: 'netCashFlow', titleKey: 'dynamicDashboard.netCashFlowTitle', icon: <CompareArrowsIcon /> },
    { id: 'accountBalance', titleKey: 'dynamicDashboard.accountBalanceTitle', icon: <AccountBalanceWalletIcon /> },
];
// --- End Available Widgets ---

// --- Component ---
export default function AddWidgetDialog({
    open,
    onClose,
    onApplyChanges,
    existingWidgetTypes = []
}) {
    const { t } = useTranslation();
    const [checkboxStates, setCheckboxStates] = useState({});
    const [initialCheckboxStates, setInitialCheckboxStates] = useState({});

    // --- useEffect and other logic remains the same ---
    useEffect(() => {
        if (open) {
            const initialStates = {};
            AVAILABLE_WIDGETS.forEach(widget => {
                initialStates[widget.id] = existingWidgetTypes.includes(widget.id);
            });
            setCheckboxStates(initialStates);
            setInitialCheckboxStates(initialStates);
        } else {
             setCheckboxStates({});
             setInitialCheckboxStates({});
        }
    }, [open, existingWidgetTypes]);

    const allWidgetIds = useMemo(() => AVAILABLE_WIDGETS.map(w => w.id), []);
    const numChecked = useMemo(() => Object.values(checkboxStates).filter(Boolean).length, [checkboxStates]);
    const isSelectAllChecked = numChecked === allWidgetIds.length;
    const isSelectAllIndeterminate = numChecked > 0 && numChecked < allWidgetIds.length;

    const handleToggleCheckbox = useCallback((widgetId) => {
        setCheckboxStates(prev => ({
            ...prev,
            [widgetId]: !prev[widgetId]
        }));
    }, []);

    const handleSelectAllToggle = useCallback((event) => {
        const isChecked = event.target.checked;
        setCheckboxStates(prev => {
            const newStates = { ...prev };
            allWidgetIds.forEach(id => {
                newStates[id] = isChecked;
            });
            return newStates;
        });
    }, [allWidgetIds]);

    const handleApplyClick = () => {
        if (onApplyChanges) {
            onApplyChanges(checkboxStates);
        }
        onClose();
    };

    const hasChanges = useMemo(() => {
        return JSON.stringify(checkboxStates) !== JSON.stringify(initialCheckboxStates);
    }, [checkboxStates, initialCheckboxStates]);
    // --- End of unchanged logic ---


    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <T>dynamicDashboard.manageWidgets</T>
                <IconButton aria-label={t('common.close')} onClick={onClose} sx={{ color: (theme) => theme.palette.grey[500] }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
                <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <FormControlLabel
                        label={<T>dynamicDashboard.selectAll</T>}
                        control={
                            <Checkbox
                                checked={isSelectAllChecked}
                                indeterminate={isSelectAllIndeterminate}
                                onChange={handleSelectAllToggle}
                                inputProps={{ 'aria-label': t('dynamicDashboard.selectAll') }}
                            />
                        }
                    />
                </Box>
                <List dense sx={{ maxHeight: '60vh', overflowY: 'auto' }}> {/* Added scroll */}
                    {/* Sort alphabetically by translated title for better UX */}
                    {AVAILABLE_WIDGETS
                        .sort((a, b) => t(a.titleKey).localeCompare(t(b.titleKey)))
                        .map((widget) => (
                            <ListItem
                                key={widget.id}
                                disablePadding
                                secondaryAction={
                                    <Checkbox
                                        edge="end"
                                        onChange={() => handleToggleCheckbox(widget.id)}
                                        checked={checkboxStates[widget.id] || false}
                                        inputProps={{ 'aria-labelledby': `widget-label-${widget.id}` }}
                                    />
                                }
                            >
                                <ListItemButton onClick={() => handleToggleCheckbox(widget.id)}>
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        {widget.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        id={`widget-label-${widget.id}`}
                                        primary={t(widget.titleKey)}
                                    />
                                </ListItemButton>
                            </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose}>
                    <T>common.cancel</T>
                </Button>
                <Button
                    onClick={handleApplyClick}
                    variant="contained"
                    disabled={!hasChanges}
                >
                    <T>dynamicDashboard.applyChanges</T>
                </Button>
            </DialogActions>
        </Dialog>
    );
}

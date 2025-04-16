// src/modules/DynamicDashboard/AddWidgetDialog.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    IconButton, Checkbox, Button, Box,
    FormControlLabel, Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
// --- Keep icon imports ---
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
// --- End Import Icons ---
import { useTranslation } from 'react-i18next';
import T from '../../utils/T';

// --- Keep AVAILABLE_WIDGETS ---
const AVAILABLE_WIDGETS = [
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
];
// --- End Available Widgets ---

// --- Component ---
export default function AddWidgetDialog({
    open,
    onClose,
    // REMOVE onAddWidget and onRemoveExistingWidget props
    onApplyChanges, // <-- NEW PROP: Passes back the desired state
    existingWidgetTypes = []
}) {
    const { t } = useTranslation();
    const [checkboxStates, setCheckboxStates] = useState({});
    const [initialCheckboxStates, setInitialCheckboxStates] = useState({});

    useEffect(() => {
        if (open) {
            const initialStates = {};
            AVAILABLE_WIDGETS.forEach(widget => {
                // Initialize based on whether the TYPE exists in the dashboard
                initialStates[widget.id] = existingWidgetTypes.includes(widget.id);
            });
            setCheckboxStates(initialStates);
            setInitialCheckboxStates(initialStates); // Store the initial state
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
            [widgetId]: !prev[widgetId] // Toggle the state for this widget type
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

    // --- Apply Changes: Call the new callback ---
    const handleApplyClick = () => {
        if (onApplyChanges) {
            onApplyChanges(checkboxStates); // Pass the final desired state (map of type -> boolean)
        }
        onClose();
    };
    // --- End Apply Changes ---

    const hasChanges = useMemo(() => {
        // Check if the current checkbox states differ from the initial states
        return JSON.stringify(checkboxStates) !== JSON.stringify(initialCheckboxStates);
    }, [checkboxStates, initialCheckboxStates]);

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
                <List dense>
                    {AVAILABLE_WIDGETS.map((widget) => (
                        <ListItem
                            key={widget.id} // Use widget type (id) as key
                            disablePadding
                            secondaryAction={
                                <Checkbox
                                    edge="end"
                                    onChange={() => handleToggleCheckbox(widget.id)}
                                    // Use the state for this widget type
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
                    onClick={handleApplyClick} // Call the handler that passes state up
                    variant="contained"
                    disabled={!hasChanges} // Disable if no changes were made
                >
                    <T>dynamicDashboard.applyChanges</T>
                </Button>
            </DialogActions>
        </Dialog>
    );
}

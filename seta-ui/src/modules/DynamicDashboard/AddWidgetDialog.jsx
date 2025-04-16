// src/modules/DynamicDashboard/AddWidgetDialog.jsx
import React, { useState, useEffect } from 'react'; // Import useState, useEffect
import {
    Dialog, DialogTitle, DialogContent, DialogActions, // Added DialogActions
    List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    IconButton, Checkbox, Button // Added Checkbox, Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
// --- Import Icons ---
// (Keep all your existing icon imports)
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
// --- End Import Icons ---
import { useTranslation } from 'react-i18next';
import T from '../../utils/T';

// --- Define Available Widgets (Keep as is) ---
const AVAILABLE_WIDGETS = [
  { id: 'overviewSummary', titleKey: 'dynamicDashboard.overviewSummary', icon: <AssessmentIcon /> },
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
    onAddWidget,
    existingWidgetTypes = [] // Receive existing types to disable adding duplicates
}) {
    const { t } = useTranslation();
    // --- State for selected widget IDs ---
    const [selectedWidgets, setSelectedWidgets] = useState([]);

    // Reset selection when dialog closes/opens
    useEffect(() => {
        if (!open) {
            setSelectedWidgets([]);
        }
    }, [open]);

    // --- Toggle selection handler ---
    const handleToggleSelect = (widgetId) => {
        setSelectedWidgets((prevSelected) =>
            prevSelected.includes(widgetId)
                ? prevSelected.filter((id) => id !== widgetId) // Remove if already selected
                : [...prevSelected, widgetId] // Add if not selected
        );
    };

    // --- Handler for adding selected widgets ---
    const handleAddSelected = () => {
        selectedWidgets.forEach(widgetId => {
            // Check if widget type already exists before adding
            const widgetConfig = AVAILABLE_WIDGETS.find(w => w.id === widgetId);
            if (widgetConfig && !existingWidgetTypes.includes(widgetConfig.id)) {
                 onAddWidget(widgetId);
            } else if (widgetConfig && existingWidgetTypes.includes(widgetConfig.id)) {
                console.warn(`Widget type "${widgetConfig.id}" already exists on the dashboard.`);
                // Optionally show a user notification here
            }
        });
        onClose(); // Close dialog after adding
    };

    // --- Check if a widget type is already on the dashboard ---
    const isWidgetAdded = (widgetId) => existingWidgetTypes.includes(widgetId);

    return (
        // Keep Dialog props
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <T>dynamicDashboard.addWidget</T>
                <IconButton aria-label={t('common.close')} onClick={onClose} sx={{ color: (theme) => theme.palette.grey[500] }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            {/* Keep dividers, adjust padding */}
            <DialogContent dividers sx={{ p: 0 }}>
                <List dense> {/* Use dense list for better spacing */}
                    {AVAILABLE_WIDGETS.map((widget) => {
                        const isSelected = selectedWidgets.includes(widget.id);
                        const isDisabled = isWidgetAdded(widget.id); // Check if already added

                        return (
                            <ListItem
                                key={widget.id}
                                disablePadding
                                // Add secondary action for the checkbox
                                secondaryAction={
                                    <Checkbox
                                        edge="end"
                                        onChange={() => handleToggleSelect(widget.id)}
                                        checked={isSelected}
                                        disabled={isDisabled} // Disable checkbox if widget exists
                                        inputProps={{ 'aria-labelledby': `widget-label-${widget.id}` }}
                                    />
                                }
                            >
                                <ListItemButton
                                    onClick={() => !isDisabled && handleToggleSelect(widget.id)} // Toggle only if not disabled
                                    selected={isSelected}
                                    disabled={isDisabled} // Disable button if widget exists
                                    sx={isDisabled ? { opacity: 0.6, cursor: 'not-allowed' } : {}} // Style disabled state
                                >
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        {widget.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        id={`widget-label-${widget.id}`}
                                        primary={t(widget.titleKey)}
                                        // Add secondary text to indicate if already added
                                        secondary={isDisabled ? t('dynamicDashboard.alreadyAdded') : null}
                                        secondaryTypographyProps={{ fontSize: '0.75rem', color: 'text.secondary' }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </DialogContent>
            {/* --- Add Dialog Actions --- */}
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose}>
                    <T>common.cancel</T> {/* Use a common cancel key */}
                </Button>
                <Button
                    onClick={handleAddSelected}
                    variant="contained"
                    disabled={selectedWidgets.filter(id => !isWidgetAdded(id)).length === 0} // Disable if no *new* widgets are selected
                >
                    <T>dynamicDashboard.addSelected</T> ({selectedWidgets.filter(id => !isWidgetAdded(id)).length}) {/* Show count of NEW widgets */}
                </Button>
            </DialogActions>
            {/* --- End Dialog Actions --- */}
        </Dialog>
    );
}

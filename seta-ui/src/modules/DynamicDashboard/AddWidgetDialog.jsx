// src/modules/DynamicDashboard/AddWidgetDialog.jsx
import React from 'react';
import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
// --- Import Icons ---
import AssessmentIcon from '@mui/icons-material/Assessment'; // Overview
import PieChartIcon from '@mui/icons-material/PieChart'; // Category Breakdown
import ListAltIcon from '@mui/icons-material/ListAlt'; // Recent Transactions
import ShowChartIcon from '@mui/icons-material/ShowChart'; // Expense Trend
import BarChartIcon from '@mui/icons-material/BarChart'; // Monthly Comparison
import CategoryIcon from '@mui/icons-material/Category'; // Top Categories
import TrendingUpIcon from '@mui/icons-material/TrendingUp'; // Largest Expenses
import CalculateIcon from '@mui/icons-material/Calculate'; // Average Daily Spend
import StackedLineChartIcon from '@mui/icons-material/StackedLineChart'; // Category Timeline
import TrackChangesIcon from '@mui/icons-material/TrackChanges'; // Spending Goal
// --- End Import Icons ---
import { useTranslation } from 'react-i18next';
import T from '../../utils/T';

// --- Define Available Widgets ---
const AVAILABLE_WIDGETS = [
  // --- Existing ---
  { id: 'overviewSummary', titleKey: 'dynamicDashboard.overviewSummary', icon: <AssessmentIcon /> },
  { id: 'categoryBreakdown', titleKey: 'dynamicDashboard.categoryBreakdown', icon: <PieChartIcon /> },
  { id: 'recentTransactions', titleKey: 'dynamicDashboard.recentTransactions', icon: <ListAltIcon /> },
  { id: 'expenseTrend', titleKey: 'dynamicDashboard.expenseTrend', icon: <ShowChartIcon /> },
  { id: 'monthlyComparison', titleKey: 'dynamicDashboard.monthlyComparison', icon: <BarChartIcon /> },
  // --- New ---
  { id: 'topSpendingCategories', titleKey: 'dynamicDashboard.topSpendingCategories', icon: <CategoryIcon /> },
  { id: 'largestExpenses', titleKey: 'dynamicDashboard.largestExpenses', icon: <TrendingUpIcon /> },
  { id: 'averageDailySpend', titleKey: 'dynamicDashboard.averageDailySpend', icon: <CalculateIcon /> },
  { id: 'categorySpendingTimeline', titleKey: 'dynamicDashboard.categorySpendingTimeline', icon: <StackedLineChartIcon /> },
  { id: 'spendingGoalTracker', titleKey: 'dynamicDashboard.spendingGoal', icon: <TrackChangesIcon /> },
  // Add other widgets as they are implemented
];
// --- End Available Widgets ---

export default function AddWidgetDialog({ open, onClose, onAddWidget }) {
    const { t } = useTranslation();

  const handleAdd = (widgetId) => {
    onAddWidget(widgetId);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <T>dynamicDashboard.addWidget</T>
        <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}> <CloseIcon /> </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <List>
          {AVAILABLE_WIDGETS.map((widget) => (
            <ListItem key={widget.id} disablePadding>
              <ListItemButton onClick={() => handleAdd(widget.id)}>
                <ListItemIcon sx={{ minWidth: 40 }}>{widget.icon}</ListItemIcon>
                <ListItemText primary={t(widget.titleKey)} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}

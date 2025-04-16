// src/modules/DynamicDashboard/AddWidgetDialog.jsx
import React from 'react';
import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
// --- Import Icons ---
import AssessmentIcon from '@mui/icons-material/Assessment'; // For Overview
import PieChartIcon from '@mui/icons-material/PieChart';
import ListAltIcon from '@mui/icons-material/ListAlt'; // For Recent Transactions
import ShowChartIcon from '@mui/icons-material/ShowChart'; // For Trend
import BarChartIcon from '@mui/icons-material/BarChart'; // For Monthly Comparison
// --- End Import Icons ---
import { useTranslation } from 'react-i18next';
import T from '../../utils/T';

// --- Define Available Widgets ---
const AVAILABLE_WIDGETS = [
  { id: 'overviewSummary', titleKey: 'dynamicDashboard.overviewSummary', icon: <AssessmentIcon /> },
  { id: 'categoryBreakdown', titleKey: 'dynamicDashboard.categoryBreakdown', icon: <PieChartIcon /> },
  { id: 'recentTransactions', titleKey: 'dynamicDashboard.recentTransactions', icon: <ListAltIcon /> },
  { id: 'expenseTrend', titleKey: 'dynamicDashboard.expenseTrend', icon: <ShowChartIcon /> },
  { id: 'monthlyComparison', titleKey: 'dynamicDashboard.monthlyComparison', icon: <BarChartIcon /> },
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
                {/* Use t() here as ListItemText expects a string node */}
                <ListItemText primary={t(widget.titleKey)} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}

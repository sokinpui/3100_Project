// src/modules/DynamicDashboard/AddWidgetDialog.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    IconButton, Checkbox, Button, Box,
    FormControlLabel, Typography, useTheme
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
import EventNoteIcon from '@mui/icons-material/EventNote';
import DonutSmallIcon from '@mui/icons-material/DonutSmall';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FlagIcon from '@mui/icons-material/Flag';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SavingsIcon from '@mui/icons-material/Savings';
import AddBoxIcon from '@mui/icons-material/AddBox';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import CompareIcon from '@mui/icons-material/Compare';
import TimelineIcon from '@mui/icons-material/Timeline'; // Already present

import { useTranslation } from 'react-i18next';
import T from '../../utils/T';

// --- Updated AVAILABLE_WIDGETS ---
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
  { id: 'upcomingBills', titleKey: 'dynamicDashboard.upcomingBillsTitle', icon: <EventNoteIcon /> },
  { id: 'budgetOverview', titleKey: 'dynamicDashboard.budgetOverviewTitle', icon: <DonutSmallIcon /> },
  { id: 'budgetComparison', titleKey: 'dynamicDashboard.budgetComparison', icon: <CompareIcon /> },
  { id: 'miniCalendar', titleKey: 'dynamicDashboard.miniCalendarTitle', icon: <CalendarMonthIcon /> },
  { id: 'goalProgress', titleKey: 'dynamicDashboard.goalProgressTitle', icon: <FlagIcon /> },
  { id: 'netCashFlow', titleKey: 'dynamicDashboard.netCashFlowTitle', icon: <CompareArrowsIcon /> },
  { id: 'accountBalance', titleKey: 'dynamicDashboard.accountBalanceTitle', icon: <AccountBalanceWalletIcon /> },
  { id: 'topIncomeSources', titleKey: 'dynamicDashboard.topIncomeSources', icon: <LeaderboardIcon /> },
  { id: 'incomeBreakdown', titleKey: 'dynamicDashboard.incomeBreakdown', icon: <DonutLargeIcon /> },
  { id: 'largestIncomes', titleKey: 'dynamicDashboard.largestIncomes', icon: <MonetizationOnIcon /> },
  { id: 'averageDailyIncome', titleKey: 'dynamicDashboard.averageDailyIncome', icon: <CalculateIcon /> },
  { id: 'incomeComparison', titleKey: 'dynamicDashboard.incomeComparison', icon: <BarChartIcon /> },
  { id: 'incomeTrend', titleKey: 'dynamicDashboard.incomeTrend', icon: <ShowChartIcon /> },
  { id: 'netFlowTrend', titleKey: 'dynamicDashboard.netFlowTrend', icon: <CompareArrowsIcon /> }, // Consider a more specific trend icon if available
  { id: 'averageDailyNetFlow', titleKey: 'dynamicDashboard.averageDailyNetFlow', icon: <CompareArrowsIcon /> }, // Same as netCashFlow, maybe differentiate?
  { id: 'netFlowComparison', titleKey: 'dynamicDashboard.netFlowComparison', icon: <BarChartIcon /> },
  { id: 'savingsRate', titleKey: 'dynamicDashboard.savingsRate', icon: <SavingsIcon /> },
  { id: 'quickAdd', titleKey: 'dynamicDashboard.quickAdd', icon: <AddBoxIcon /> },
  { id: 'topUnbudgetedCategory', titleKey: 'dynamicDashboard.topUnbudgetedCategory', icon: <WarningAmberIcon /> },
  { id: 'goalTargetDateEstimate', titleKey: 'dynamicDashboard.goalTargetDateEstimate', icon: <QueryStatsIcon /> },
  { id: 'accountDetail', titleKey: 'dynamicDashboard.accountDetail', icon: <AccountBoxIcon /> },
  { id: 'incomeTimeline', titleKey: 'dynamicDashboard.incomeTimeline', icon: <StackedLineChartIcon /> }, // Using StackedLineChart for consistency
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
  const theme = useTheme();
  const [checkboxStates, setCheckboxStates] = useState({});
  const [initialCheckboxStates, setInitialCheckboxStates] = useState({});

  // State for preview
  const [hoveredWidgetId, setHoveredWidgetId] = useState(null);
  const [currentHoveredWidgetDetails, setCurrentHoveredWidgetDetails] = useState(null);
  const [previewImageSrc, setPreviewImageSrc] = useState('');
  const [previewImageError, setPreviewImageError] = useState(false);


  useEffect(() => {
    if (open) {
      const initialStates = {};
      AVAILABLE_WIDGETS.forEach(widget => {
        initialStates[widget.id] = existingWidgetTypes.includes(widget.id);
      });
      setCheckboxStates(initialStates);
      setInitialCheckboxStates(initialStates);
      // Reset hover state when dialog opens
      setHoveredWidgetId(null);
      setCurrentHoveredWidgetDetails(null);
      setPreviewImageError(false);
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

  const handleWidgetMouseEnter = (widgetId) => {
    const widgetDetails = AVAILABLE_WIDGETS.find(w => w.id === widgetId);
    if (widgetDetails) {
      setHoveredWidgetId(widgetId);
      setCurrentHoveredWidgetDetails(widgetDetails);
      setPreviewImageSrc(`/assets/widget_previews/${widgetId}.png`);
      setPreviewImageError(false);
    }
  };

  const handleWidgetMouseLeave = () => {
    // Optional: Keep preview if mouse moves to preview panel
    // For simplicity now, clear on leaving list item area.
    // setHoveredWidgetId(null);
    // setCurrentHoveredWidgetDetails(null);
  };

  const handleListMouseLeave = () => {
    setHoveredWidgetId(null);
    setCurrentHoveredWidgetDetails(null);
  };


  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth> {/* Changed maxWidth to 'md' */}
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <T>dynamicDashboard.manageWidgets</T>
        <IconButton aria-label={t('common.close')} onClick={onClose} sx={{ color: (theme) => theme.palette.grey[500] }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', p: 0, height: {xs: '70vh', sm: '60vh'} }}> {/* Flex layout */}
        <Box sx={{ width: '50%', borderRight: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
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
            <List
                dense
                sx={{ flexGrow: 1, overflowY: 'auto', py:0 }}
                onMouseLeave={handleListMouseLeave} // Clear preview when mouse leaves the list area
            >
            {AVAILABLE_WIDGETS
                .sort((a, b) => t(a.titleKey).localeCompare(t(b.titleKey)))
                .map((widget) => (
                <ListItem
                    key={widget.id}
                    disablePadding
                    onMouseEnter={() => handleWidgetMouseEnter(widget.id)}
                    // onMouseLeave={handleWidgetMouseLeave} // Can be added if finer control needed
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
        </Box>
        <Box sx={{ width: '50%', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.palette.background.default }}>
            {/* Preview Area */}
            {hoveredWidgetId && currentHoveredWidgetDetails ? (
                <Box sx={{ textAlign: 'center', p:1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'medium', mb: 2}}>
                    {t(currentHoveredWidgetDetails.titleKey)}
                    </Typography>
                    {previewImageError ? (
                    <Typography variant="caption" color="text.secondary">
                        <T>dynamicDashboard.noPreviewAvailable</T>
                    </Typography>
                    ) : (
                    <img
                        src={previewImageSrc}
                        alt={t('dynamicDashboard.widgetPreviewAlt', { widgetName: t(currentHoveredWidgetDetails.titleKey) })}
                        style={{
                            maxWidth: '100%',
                            maxHeight: 'calc(100% - 60px)', // Adjust based on title height and padding
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: '4px',
                            objectFit: 'contain',
                            backgroundColor: theme.palette.background.paper // Ensure image background is distinct if transparent
                        }}
                        onError={() => setPreviewImageError(true)}
                        onLoad={() => setPreviewImageError(false)}
                    />
                    )}
                </Box>
                ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                    <Typography color="text.secondary">
                    <T>dynamicDashboard.hoverForPreview</T>
                    </Typography>
                </Box>
            )}
        </Box>
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

// src/modules/DynamicDashboard/AddWidgetDialog.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    IconButton, Checkbox, Button, Box,
    FormControlLabel, Typography, useTheme, CircularProgress
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
// import TrackChangesIcon from '@mui/icons-material/TrackChanges'; // Not used in current AVAILABLE_WIDGETS
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
// import TimelineIcon from '@mui/icons-material/Timeline'; // Already present, not directly in map

import { useTranslation } from 'react-i18next';
import T from '../../utils/T';
import WidgetWrapper from './widgets/WidgetWrapper';

// --- Updated AVAILABLE_WIDGETS (maps to keys in WIDGET_COMPONENTS from DynamicDashboard.jsx) ---
// This list defines what shows in the dialog. The actual components come from the map.
const AVAILABLE_WIDGET_DEFINITIONS = [
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
  { id: 'netFlowTrend', titleKey: 'dynamicDashboard.netFlowTrend', icon: <CompareArrowsIcon /> },
  { id: 'averageDailyNetFlow', titleKey: 'dynamicDashboard.averageDailyNetFlow', icon: <CompareArrowsIcon /> },
  { id: 'netFlowComparison', titleKey: 'dynamicDashboard.netFlowComparison', icon: <BarChartIcon /> },
  { id: 'savingsRate', titleKey: 'dynamicDashboard.savingsRate', icon: <SavingsIcon /> },
  { id: 'quickAdd', titleKey: 'dynamicDashboard.quickAdd', icon: <AddBoxIcon /> },
  { id: 'topUnbudgetedCategory', titleKey: 'dynamicDashboard.topUnbudgetedCategory', icon: <WarningAmberIcon /> },
  { id: 'goalTargetDateEstimate', titleKey: 'dynamicDashboard.goalTargetDateEstimate', icon: <QueryStatsIcon /> },
  { id: 'accountDetail', titleKey: 'dynamicDashboard.accountDetail', icon: <AccountBoxIcon /> },
  { id: 'incomeTimeline', titleKey: 'dynamicDashboard.incomeTimeline', icon: <StackedLineChartIcon /> },
];
// --- End Available Widgets ---

const PREVIEW_SCALE = 0.6; // Adjusted scale factor, can be tuned

export default function AddWidgetDialog({
  open,
  onClose,
  onApplyChanges,
  existingWidgetTypes = [],
  widgetComponentsMap,
  livePreviewData
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [checkboxStates, setCheckboxStates] = useState({});
  const [initialCheckboxStates, setInitialCheckboxStates] = useState({});
  const [hoveredWidgetDef, setHoveredWidgetDef] = useState(null);

  useEffect(() => {
    if (open) {
      const initialStates = {};
      AVAILABLE_WIDGET_DEFINITIONS.forEach(widgetDef => {
        initialStates[widgetDef.id] = existingWidgetTypes.includes(widgetDef.id);
      });
      setCheckboxStates(initialStates);
      setInitialCheckboxStates(initialStates);
      setHoveredWidgetDef(null);
    } else {
      setCheckboxStates({});
      setInitialCheckboxStates({});
    }
  }, [open, existingWidgetTypes]);

  const allWidgetIds = useMemo(() => AVAILABLE_WIDGET_DEFINITIONS.map(w => w.id), []);
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

  const handleWidgetMouseEnter = (widgetDef) => {
    setHoveredWidgetDef(widgetDef);
  };

  const handleListMouseLeave = () => {
    setHoveredWidgetDef(null);
  };

  const renderPreview = () => {
    if (!hoveredWidgetDef || !widgetComponentsMap || !livePreviewData) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                <Typography color="text.secondary">
                    <T>dynamicDashboard.hoverForPreview</T>
                </Typography>
            </Box>
        );
    }

    const widgetConfig = widgetComponentsMap[hoveredWidgetDef.id];
    if (!widgetConfig || !widgetConfig.component) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                    <T>dynamicDashboard.noPreviewAvailable</T>
                </Typography>
            </Box>
        );
    }

    const PreviewComponent = widgetConfig.component;
    let previewSpecificProps = { ...livePreviewData };

    // Override or add specific props for preview context
    // Note: livePreviewData already contains no-op handlers for showNotification, onDataAdded, onFilterChange
    // We just need to ensure currentFilters is correctly passed to FilterWidget if it uses that name.
    if (hoveredWidgetDef.id === 'filterWidget') {
        previewSpecificProps.currentFilters = livePreviewData.activeFilters;
        previewSpecificProps.isLoadingData = livePreviewData.isLoading;
    }
    // For other widgets, they should generally work with the spread livePreviewData.
    // Widgets like UpcomingBills, GoalProgress will use livePreviewData.userId for their internal fetches.

    const viewportWidth = (widgetConfig.defaultLayout?.w || 4) * 90;
    const viewportHeight = (widgetConfig.defaultLayout?.h || 4) * 50;

    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 1,
            }}
        >
            <Typography
                variant="subtitle1"
                gutterBottom
                sx={{
                    fontWeight: 'medium',
                    mb: 1,
                    height: 'auto',
                    maxHeight: '60px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'normal',
                    textAlign: 'center',
                    width: '100%'
                }}
            >
                {t(hoveredWidgetDef.titleKey)}
            </Typography>
            <Box
                sx={{
                    width: `calc(${viewportWidth}px * ${PREVIEW_SCALE})`,
                    height: `calc(${viewportHeight}px * ${PREVIEW_SCALE})`,
                    overflow: 'hidden',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: theme.shape.borderRadius,
                    boxShadow: theme.shadows[2],
                    position: 'relative',
                    bgcolor: 'background.paper',
                }}
            >
                <Box
                    sx={{
                        width: `${viewportWidth}px`,
                        height: `${viewportHeight}px`,
                        transform: `scale(${PREVIEW_SCALE})`,
                        transformOrigin: 'top left',
                    }}
                >
                    <WidgetWrapper titleKey={hoveredWidgetDef.titleKey} widgetId="preview-item" onRemoveWidget={null}>
                        {livePreviewData.isLoading && hoveredWidgetDef.id !== 'filterWidget' ? // Show loader if main data is loading, except for filter widget
                            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}><CircularProgress size={24}/></Box> :
                            <PreviewComponent {...previewSpecificProps} />
                        }
                    </WidgetWrapper>
                </Box>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, cursor: 'default' }} />
            </Box>
        </Box>
    );
  };


  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <T>dynamicDashboard.manageWidgets</T>
        <IconButton aria-label={t('common.close')} onClick={onClose} sx={{ color: (theme) => theme.palette.grey[500] }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
            display: 'flex',
            p: 0,
            height: {xs: '70vh', sm: '65vh', md: '60vh'},
            minHeight: '400px'
        }}
      >
        <Box sx={{ width: '50%', borderRight: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
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
                onMouseLeave={handleListMouseLeave}
            >
            {AVAILABLE_WIDGET_DEFINITIONS
                .sort((a, b) => t(a.titleKey).localeCompare(t(b.titleKey)))
                .map((widgetDef) => (
                <ListItem
                    key={widgetDef.id}
                    disablePadding
                    onMouseEnter={() => handleWidgetMouseEnter(widgetDef)}
                    secondaryAction={
                    <Checkbox
                        edge="end"
                        onChange={() => handleToggleCheckbox(widgetDef.id)}
                        checked={checkboxStates[widgetDef.id] || false}
                        inputProps={{ 'aria-labelledby': `widget-label-${widgetDef.id}` }}
                    />
                    }
                >
                    <ListItemButton onClick={() => handleToggleCheckbox(widgetDef.id)}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                        {widgetDef.icon}
                    </ListItemIcon>
                    <ListItemText
                        id={`widget-label-${widgetDef.id}`}
                        primary={t(widgetDef.titleKey)}
                    />
                    </ListItemButton>
                </ListItem>
                ))}
            </List>
        </Box>
        <Box sx={{
            width: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
            overflow: 'hidden'
        }}>
            {renderPreview()}
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

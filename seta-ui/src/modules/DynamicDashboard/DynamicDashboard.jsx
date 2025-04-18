// src/modules/DynamicDashboard/DynamicDashboard.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Box, Button, Container, CircularProgress, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { parseISO, isWithinInterval, startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, isValid } from 'date-fns';

// --- Widget Imports ---
import WidgetWrapper from './widgets/WidgetWrapper';
import OverviewSummaryWidget from './widgets/OverviewSummaryWidget';
import CategoryBreakdownWidget from './widgets/CategoryBreakdownWidget';
import RecentTransactionsWidget from './widgets/RecentTransactionsWidget';
import ExpenseTrendWidget from './widgets/ExpenseTrendWidget';
import MonthlyComparisonWidget from './widgets/MonthlyComparisonWidget';
import TimePeriodSelectorWidget from './widgets/TimePeriodSelectorWidget';
import TopSpendingCategoriesWidget from './widgets/TopSpendingCategoriesWidget';
import LargestExpensesWidget from './widgets/LargestExpensesWidget';
import AverageDailySpendWidget from './widgets/AverageDailySpendWidget';
import CategorySpendingTimelineWidget from './widgets/CategorySpendingTimelineWidget';
import FilterWidget from './widgets/FilterWidget';
import UpcomingBillsWidget from './widgets/UpcomingBillsWidget';
import BudgetOverviewWidget from './widgets/BudgetOverviewWidget';
import MiniCalendarWidget from './widgets/MiniCalendarWidget';
import GoalProgressWidget from './widgets/GoalProgressWidget';
import NetCashFlowWidget from './widgets/NetCashFlowWidget';
import AccountBalanceWidget from './widgets/AccountBalanceWidget';
import TopIncomeSourcesWidget from './widgets/TopIncomeSourcesWidget';
import IncomeBreakdownWidget from './widgets/IncomeBreakdownWidget';
import LargestIncomeWidget from './widgets/LargestIncomeWidget';

import AddWidgetDialog from './AddWidgetDialog';
import T from '../../utils/T';

// --- Constants ---
const ResponsiveGridLayout = WidthProvider(Responsive);
const API_URL = 'http://localhost:8000';
const LAYOUT_STORAGE_KEY = 'dynamicDashboardLayout_v2';
const FILTER_STORAGE_KEY = 'dynamicDashboardFilters_v2';
const WIDGET_REMOVE_SELECTOR = '.widget-remove-button';
const WIDGET_DRAG_HANDLE_SELECTOR = '.widget-drag-handle';
const DEFAULT_MAX_AMOUNT = 1000;
const DEFAULT_FILTERS = { categories: [], amountRange: [0, DEFAULT_MAX_AMOUNT] };

const WIDGET_COMPONENTS = {
  overviewSummary: {
    component: OverviewSummaryWidget,
    titleKey: 'dynamicDashboard.overviewSummary',
    defaultLayout: { w: 4, h: 4, minW: 3, minH: 3 }
  },
  filterWidget: {
    component: FilterWidget,
    titleKey: 'dynamicDashboard.filterWidgetTitle',
    defaultLayout: { w: 3, h: 5, minW: 2, minH: 4, isResizable: true }
  },
  categoryBreakdown: {
    component: CategoryBreakdownWidget,
    titleKey: 'dynamicDashboard.categoryBreakdown',
    defaultLayout: { w: 4, h: 6, minW: 3, minH: 4 }
  },
  recentTransactions: {
    component: RecentTransactionsWidget,
    titleKey: 'dynamicDashboard.recentTransactions',
    defaultLayout: { w: 4, h: 7, minW: 3, minH: 5 }
  },
  expenseTrend: {
    component: ExpenseTrendWidget,
    titleKey: 'dynamicDashboard.expenseTrend',
    defaultLayout: { w: 6, h: 6, minW: 3, minH: 3 }
  },
  monthlyComparison: {
    component: MonthlyComparisonWidget,
    titleKey: 'dynamicDashboard.monthlyComparison',
    defaultLayout: { w: 6, h: 6, minW: 3, minH: 3 }
  },
  topSpendingCategories: {
    component: TopSpendingCategoriesWidget,
    titleKey: 'dynamicDashboard.topSpendingCategories',
    defaultLayout: { w: 4, h: 6, minW: 2, minH: 3 }
  },
  largestExpenses: {
    component: LargestExpensesWidget,
    titleKey: 'dynamicDashboard.largestExpenses',
    defaultLayout: { w: 4, h: 6, minW: 2, minH: 3 }
  },
  averageDailySpend: {
    component: AverageDailySpendWidget,
    titleKey: 'dynamicDashboard.averageDailySpend',
    defaultLayout: { w: 4, h: 3, minW: 2, minH: 2 }
  },
  categorySpendingTimeline: {
    component: CategorySpendingTimelineWidget,
    titleKey: 'dynamicDashboard.categorySpendingTimeline',
    defaultLayout: { w: 8, h: 7, minW: 4, minH: 4 }
  },
  upcomingBills: {
    component: UpcomingBillsWidget,
    titleKey: 'dynamicDashboard.upcomingBillsTitle',
    defaultLayout: { w: 4, h: 5, minW: 2, minH: 3 }
  },
  budgetOverview: {
    component: BudgetOverviewWidget,
    titleKey: 'dynamicDashboard.budgetOverviewTitle',
    defaultLayout: { w: 5, h: 6, minW: 3, minH: 4 }
  },
  miniCalendar: {
    component: MiniCalendarWidget,
    titleKey: 'dynamicDashboard.miniCalendarTitle',
    defaultLayout: { w: 4, h: 6, minW: 3, minH: 4 }
  },
  goalProgress: {
    component: GoalProgressWidget,
    titleKey: 'dynamicDashboard.goalProgressTitle',
    defaultLayout: { w: 4, h: 5, minW: 2, minH: 3 }
  },
  netCashFlow: {
    component: NetCashFlowWidget,
    titleKey: 'dynamicDashboard.netCashFlowTitle',
    defaultLayout: { w: 4, h: 3, minW: 2, minH: 2 }
  },
  accountBalance: {
    component: AccountBalanceWidget,
    titleKey: 'dynamicDashboard.accountBalanceTitle',
    defaultLayout: { w: 5, h: 5, minW: 3, minH: 3 }
  },
  // --- NEW Income Widgets ---
  topIncomeSources: {
    component: TopIncomeSourcesWidget,
    titleKey: 'dynamicDashboard.topIncomeSources',
    defaultLayout: { w: 4, h: 6, minW: 2, minH: 3 }
  },
  incomeBreakdown: {
    component: IncomeBreakdownWidget,
    titleKey: 'dynamicDashboard.incomeBreakdown',
    defaultLayout: { w: 4, h: 6, minW: 3, minH: 4 }
  },
  largestIncomes: {
    component: LargestIncomeWidget,
    titleKey: 'dynamicDashboard.largestIncomes',
    defaultLayout: { w: 4, h: 6, minW: 2, minH: 3 }
  },
};

export default function DynamicDashboard() {
  const { t } = useTranslation();
  const userId = localStorage.getItem('userId');

  // --- State ---
  const [layouts, setLayouts] = useState({});
  const [widgets, setWidgets] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [allIncome, setAllIncome] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isAddWidgetDialogOpen, setIsAddWidgetDialogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [timePeriod, setTimePeriod] = useState({ startDate: null, endDate: null });

  // Initialize activeFilters from localStorage if available
  const [activeFilters, setActiveFilters] = useState(() => {
    const savedFilters = localStorage.getItem(FILTER_STORAGE_KEY);
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        return {
          categories: Array.isArray(parsedFilters.categories) ? parsedFilters.categories : [],
          amountRange: Array.isArray(parsedFilters.amountRange) && parsedFilters.amountRange.length === 2
            ? [Math.max(0, parsedFilters.amountRange[0]), Math.max(0, parsedFilters.amountRange[1])]
            : [0, DEFAULT_MAX_AMOUNT]
        };
      } catch (e) {
        console.error("Failed to parse saved filters", e);
      }
    }
    return DEFAULT_FILTERS;
  });

  // --- Load Layout ---
  useEffect(() => {
    const savedData = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.widgets && parsedData.layouts) {
          const validWidgets = parsedData.widgets.filter(w => WIDGET_COMPONENTS[w.type]);
          const validLayouts = {};
          Object.keys(parsedData.layouts).forEach(bp => {
            validLayouts[bp] = parsedData.layouts[bp].filter(l => validWidgets.some(w => w.id === l.i));
          });
          setWidgets(validWidgets);
          setLayouts(validLayouts);
        } else {
          initializeDefaultLayout();
        }
      } catch (e) {
        console.error("Failed to parse saved layout", e);
        initializeDefaultLayout();
      }
    } else {
      initializeDefaultLayout();
    }
    setIsMounted(true);
  }, []);

  // --- Initialize Default ---
  const initializeDefaultLayout = () => {
    const initialWidgets = [
      { id: uuidv4(), type: 'overviewSummary' },
      { id: uuidv4(), type: 'accountBalance' },
      { id: uuidv4(), type: 'categoryBreakdown' },
      { id: uuidv4(), type: 'recentTransactions' },
    ];
    setWidgets(initialWidgets);
    const initialLgLayout = initialWidgets.map((widget, index) => ({
      i: widget.id,
      x: (index % 3) * 4,
      y: Math.floor(index / 3) * 6,
      ...WIDGET_COMPONENTS[widget.type].defaultLayout,
    }));
    setLayouts({ lg: initialLgLayout });
  };

  // --- Save Layout ---
  useEffect(() => {
    if (isMounted && widgets.length > 0) {
      try {
        const dataToSave = JSON.stringify({ layouts, widgets });
        localStorage.setItem(LAYOUT_STORAGE_KEY, dataToSave);
      } catch (e) {
        console.error("Failed to save dashboard layout", e);
      }
    } else if (isMounted && widgets.length === 0) {
      localStorage.removeItem(LAYOUT_STORAGE_KEY);
    }
  }, [layouts, widgets, isMounted]);

  // --- Save Filters ---
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(activeFilters));
      } catch (e) {
        console.error("Failed to save filters", e);
      }
    }
  }, [activeFilters, isMounted]);

  // --- Fetch ALL Expenses and Income ---
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setIsLoadingData(false);
        return;
      }
      setIsLoadingData(true);
      try {
        const [expenseResponse, incomeResponse] = await Promise.all([
          axios.get(`${API_URL}/expenses/${userId}`),
          axios.get(`${API_URL}/income/${userId}`),
        ]);
        setAllExpenses(expenseResponse.data || []);
        setAllIncome(incomeResponse.data || []);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
        setAllExpenses([]);
        setAllIncome([]);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [userId]);

  // --- Calculate Time-Period Filtered Expenses ---
  const timePeriodFilteredExpenses = useMemo(() => {
    let expensesToFilter = allExpenses;
    if (timePeriod && timePeriod.startDate && timePeriod.endDate) {
      const interval = { start: timePeriod.startDate, end: timePeriod.endDate };
      expensesToFilter = expensesToFilter.filter(expense => {
        try {
          const expenseDate = parseISO(expense.date);
          return isValid(expenseDate) && isWithinInterval(expenseDate, interval);
        } catch (e) {
          return false;
        }
      });
    } else if (timePeriod && (timePeriod.startDate || timePeriod.endDate)) {
      if (timePeriod.presetKey !== 'allTime') {
        expensesToFilter = [];
      }
    }
    return expensesToFilter;
  }, [allExpenses, timePeriod]);

  // --- Calculate Time-Period Filtered Income ---
  const timePeriodFilteredIncome = useMemo(() => {
    let incomeToFilter = allIncome;
    if (timePeriod && timePeriod.startDate && timePeriod.endDate) {
      const interval = { start: timePeriod.startDate, end: timePeriod.endDate };
      incomeToFilter = incomeToFilter.filter(income => {
        try {
          const incomeDate = parseISO(income.date);
          return isValid(incomeDate) && isWithinInterval(incomeDate, interval);
        } catch (e) {
          return false;
        }
      });
    } else if (timePeriod && (timePeriod.startDate || timePeriod.endDate)) {
      if (timePeriod.presetKey !== 'allTime') {
        incomeToFilter = [];
      }
    }
    return incomeToFilter;
  }, [allIncome, timePeriod]);

  // --- Calculate Combined Categories/Sources ---
  const allCategoriesAndSources = useMemo(() => {
    const expenseCats = new Set(allExpenses.map(e => e.category_name).filter(Boolean));
    const incomeSources = new Set(allIncome.map(i => i.source).filter(Boolean));
    return Array.from(new Set([...expenseCats, ...incomeSources])).sort();
  }, [allExpenses, allIncome]);

  // --- Calculate Max Transaction Amount ---
  const maxTransactionAmount = useMemo(() => {
    if (isLoadingData) return Math.max(activeFilters.amountRange[1], DEFAULT_MAX_AMOUNT);

    const expensesToConsider = timePeriodFilteredExpenses || [];
    const incomeToConsider = timePeriodFilteredIncome || [];

    const maxExpense = expensesToConsider.reduce((maxVal, item) => Math.max(maxVal, parseFloat(item.amount) || 0), 0);
    const maxIncome = incomeToConsider.reduce((maxVal, item) => Math.max(maxVal, parseFloat(item.amount) || 0), 0);

    const overallMax = Math.max(maxExpense, maxIncome);
    return Math.max(overallMax, DEFAULT_MAX_AMOUNT);
  }, [timePeriodFilteredExpenses, timePeriodFilteredIncome, isLoadingData, activeFilters.amountRange]);

  // --- Adjust amount range filter if maxTransactionAmount decreases ---
  useEffect(() => {
    if (!isLoadingData) {
      const [currentMin, currentMax] = activeFilters.amountRange;
      let newMax = Math.min(currentMax, maxTransactionAmount);
      let newMin = Math.min(currentMin, newMax);
      if (newMin !== currentMin || newMax !== currentMax) {
        setActiveFilters(prev => ({
          ...prev,
          amountRange: [newMin, newMax]
        }));
      }
    }
  }, [maxTransactionAmount, isLoadingData]);

  // --- Apply Active Filters to Expenses ---
  const filteredExpenses = useMemo(() => {
    let expensesToFilter = timePeriodFilteredExpenses;
    if (activeFilters.categories && activeFilters.categories.length > 0) {
      expensesToFilter = expensesToFilter.filter(expense =>
        activeFilters.categories.includes(expense.category_name)
      );
    }
    if (activeFilters.amountRange) {
      const [minAmount, maxAmount] = activeFilters.amountRange;
      expensesToFilter = expensesToFilter.filter(expense => {
        const amount = parseFloat(expense.amount) || 0;
        return amount >= minAmount && amount <= maxAmount;
      });
    }
    return expensesToFilter;
  }, [timePeriodFilteredExpenses, activeFilters]);

  // --- Apply Active Filters to Income ---
  const filteredIncome = useMemo(() => {
    let incomeToFilter = timePeriodFilteredIncome;
    if (activeFilters.categories && activeFilters.categories.length > 0) {
      incomeToFilter = incomeToFilter.filter(income =>
        activeFilters.categories.includes(income.source)
      );
    }
    if (activeFilters.amountRange) {
      const [minAmount, maxAmount] = activeFilters.amountRange;
      incomeToFilter = incomeToFilter.filter(income => {
        const amount = parseFloat(income.amount) || 0;
        return amount >= minAmount && amount <= maxAmount;
      });
    }
    return incomeToFilter;
  }, [timePeriodFilteredIncome, activeFilters]);

  // --- Layout Change Handler ---
  const handleLayoutChange = useCallback((layout, allLayouts) => {
    if (isMounted && JSON.stringify(allLayouts) !== JSON.stringify(layouts)) {
      setLayouts(allLayouts);
    }
  }, [isMounted, layouts]);

  // --- Add/Remove Widget Helpers ---
  const addSingleWidget = useCallback((widgetType) => {
    const widgetConfig = WIDGET_COMPONENTS[widgetType];
    if (!widgetConfig) return;
    const newWidget = { id: uuidv4(), type: widgetType };
    setWidgets(prev => [...prev, newWidget]);
    setLayouts(prevLayouts => {
      const newLayouts = { ...prevLayouts };
      const breakpoints = Object.keys(prevLayouts).length > 0 ? Object.keys(prevLayouts) : ['lg'];
      breakpoints.forEach(breakpoint => {
        const currentBreakpointLayout = newLayouts[breakpoint] || [];
        const maxY = Math.max(0, ...currentBreakpointLayout.map(item => item.y + item.h));
        newLayouts[breakpoint] = [
          ...currentBreakpointLayout,
          { i: newWidget.id, x: 0, y: maxY, ...widgetConfig.defaultLayout }
        ];
      });
      return newLayouts;
    });
  }, []);

  const removeSingleWidget = useCallback((widgetInstanceId) => {
    setWidgets(prev => prev.filter(widget => {
      if (widget.id === widgetInstanceId && widget.type === 'filterWidget') {
        setActiveFilters({ categories: [], amountRange: [0, maxTransactionAmount] });
      }
      return widget.id !== widgetInstanceId;
    }));
    setLayouts(prevLayouts => {
      const newLayouts = {};
      Object.keys(prevLayouts).forEach(breakpoint => {
        newLayouts[breakpoint] = prevLayouts[breakpoint].filter(item => item.i !== widgetInstanceId);
      });
      return newLayouts;
    });
  }, [maxTransactionAmount]);

  // --- Handler for Dialog Apply Changes ---
  const handleApplyWidgetChanges = useCallback((desiredStates) => {
    const currentWidgetsMap = new Map(widgets.map(w => [w.type, w.id]));
    Object.entries(desiredStates).forEach(([widgetType, shouldBePresent]) => {
      const isCurrentlyPresent = currentWidgetsMap.has(widgetType);
      if (shouldBePresent && !isCurrentlyPresent) {
        addSingleWidget(widgetType);
      } else if (!shouldBePresent && isCurrentlyPresent) {
        const instanceIdToRemove = currentWidgetsMap.get(widgetType);
        if (instanceIdToRemove) {
          removeSingleWidget(instanceIdToRemove);
        }
      }
    });
    setIsAddWidgetDialogOpen(false);
  }, [widgets, addSingleWidget, removeSingleWidget]);

  // --- Callback for Filter Widget ---
  const handleFilterChange = useCallback((newFilters) => {
    const adjustedRange = [...newFilters.amountRange];
    if (adjustedRange[1] > maxTransactionAmount) adjustedRange[1] = maxTransactionAmount;
    if (adjustedRange[0] > adjustedRange[1]) adjustedRange[0] = adjustedRange[1];
    setActiveFilters({
      categories: newFilters.categories,
      amountRange: adjustedRange
    });
  }, [maxTransactionAmount]);

  // --- Render Widgets ---
  const renderWidgets = () => {
    return widgets.map((widget) => {
      const config = WIDGET_COMPONENTS[widget.type];
      if (!config) {
        console.warn(`Widget config not found for type: ${widget.type}`);
        return null;
      }
      const WidgetComponent = config.component;

      const commonWidgetProps = {
        expenses: filteredExpenses,
        income: filteredIncome,
        isLoading: isLoadingData,
        userId: userId,
        timePeriod: timePeriod,
        activeFilters: activeFilters,
      };

      const extraProps = widget.type === 'filterWidget'
        ? {
            onFilterChange: handleFilterChange,
            currentFilters: activeFilters,
            availableCategories: allCategoriesAndSources,
            maxAmount: maxTransactionAmount,
            isLoadingData: isLoadingData,
          }
        : {};

      const handleRemoveThisWidget = () => removeSingleWidget(widget.id);

      return (
        <div key={widget.id} className="widget-grid-item">
          <WidgetWrapper
            titleKey={config.titleKey}
            widgetId={widget.id}
            onRemoveWidget={handleRemoveThisWidget}
          >
            {widget.type === 'filterWidget' && isLoadingData ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <WidgetComponent
                {...commonWidgetProps}
                {...extraProps}
              />
            )}
          </WidgetWrapper>
        </div>
      );
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h1"> <T>dynamicDashboard.title</T> </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsAddWidgetDialogOpen(true)}>
          <T>dynamicDashboard.manageWidgets</T>
        </Button>
      </Box>

      <TimePeriodSelectorWidget onPeriodChange={setTimePeriod} />

      {!isMounted || isLoadingData ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
      ) : widgets.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 5, border: '1px dashed grey', borderRadius: 1, minHeight: 200 }}>
          <Typography color="text.secondary"> <T>dynamicDashboard.emptyDashboard</T> </Typography>
        </Box>
      ) : (
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={50}
          margin={[15, 15]}
          containerPadding={[10, 10]}
          onLayoutChange={handleLayoutChange}
          isDraggable
          isResizable
          draggableCancel={WIDGET_REMOVE_SELECTOR}
          draggableHandle={WIDGET_DRAG_HANDLE_SELECTOR}
          useCSSTransforms={true}
        >
          {renderWidgets()}
        </ResponsiveGridLayout>
      )}

      <AddWidgetDialog
        open={isAddWidgetDialogOpen}
        onClose={() => setIsAddWidgetDialogOpen(false)}
        onApplyChanges={handleApplyWidgetChanges}
        existingWidgetTypes={widgets.map(w => w.type)}
      />
    </Container>
  );
}

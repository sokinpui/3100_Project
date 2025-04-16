// src/modules/DynamicDashboard/DynamicDashboard.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Box, Button, Container, CircularProgress, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { parseISO, isWithinInterval, startOfDay, endOfDay, startOfMonth, endOfMonth, subDays } from 'date-fns';

// --- Import Widgets ---
import WidgetWrapper from './widgets/WidgetWrapper';
import OverviewSummaryWidget from './widgets/OverviewSummaryWidget';
import CategoryBreakdownWidget from './widgets/CategoryBreakdownWidget';
import RecentTransactionsWidget from './widgets/RecentTransactionsWidget';
import ExpenseTrendWidget from './widgets/ExpenseTrendWidget';
import MonthlyComparisonWidget from './widgets/MonthlyComparisonWidget';
import TimePeriodSelectorWidget from './widgets/TimePeriodSelectorWidget';
// --- End Import Widgets ---

import AddWidgetDialog from './AddWidgetDialog';
import T from '../../utils/T';

const ResponsiveGridLayout = WidthProvider(Responsive);
const API_URL = 'http://localhost:8000';
const LAYOUT_STORAGE_KEY = 'dynamicDashboardLayout_v1';

// --- Define the cancel selector for the remove button ---
const WIDGET_REMOVE_SELECTOR = '.widget-remove-button';
// --- End Define Selector ---

const WIDGET_COMPONENTS = {
  overviewSummary: { component: OverviewSummaryWidget, titleKey: 'dynamicDashboard.overviewSummary', defaultLayout: { w: 4, h: 3, minW: 3, minH: 3 } },
  categoryBreakdown: { component: CategoryBreakdownWidget, titleKey: 'dynamicDashboard.categoryBreakdown', defaultLayout: { w: 4, h: 6, minW: 3, minH: 5 } },
  recentTransactions: { component: RecentTransactionsWidget, titleKey: 'dynamicDashboard.recentTransactions', defaultLayout: { w: 4, h: 6, minW: 3, minH: 5 } },
  expenseTrend: { component: ExpenseTrendWidget, titleKey: 'dynamicDashboard.expenseTrend', defaultLayout: { w: 6, h: 6, minW: 4, minH: 4 } },
  monthlyComparison: { component: MonthlyComparisonWidget, titleKey: 'dynamicDashboard.monthlyComparison', defaultLayout: { w: 6, h: 6, minW: 4, minH: 4 } },
};

// --- Helper to get initial dates for a preset ---
const getInitialDatesForPreset = (presetKey) => {
  const now = new Date();
  switch (presetKey) {
    case 'last7days': return { startDate: startOfDay(subDays(now, 6)), endDate: endOfDay(now) };
    case 'last30days': return { startDate: startOfDay(subDays(now, 29)), endDate: endOfDay(now) };
    case 'currentMonth': return { startDate: startOfDay(startOfMonth(now)), endDate: endOfDay(endOfMonth(now)) };
    case 'allTime': default: return { startDate: null, endDate: null };
  }
};
// --- End Helper ---

export default function DynamicDashboard() {
  const { t } = useTranslation();
  const userId = localStorage.getItem('userId');

  // --- State ---
  const [layouts, setLayouts] = useState({});
  const [widgets, setWidgets] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isAddWidgetDialogOpen, setIsAddWidgetDialogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [timePeriod, setTimePeriod] = useState(getInitialDatesForPreset('currentMonth'));
  // --- End State ---

  // --- Load Layout ---
  useEffect(() => {
    const savedData = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.widgets && parsedData.layouts) {
          const validWidgets = parsedData.widgets.filter((w) => WIDGET_COMPONENTS[w.type]);
          const validLayouts = {};
          Object.keys(parsedData.layouts).forEach((bp) => {
            validLayouts[bp] = parsedData.layouts[bp].filter((l) => validWidgets.some((w) => w.id === l.i));
          });
          setWidgets(validWidgets);
          setLayouts(validLayouts);
        } else {
          initializeDefaultLayout();
        }
      } catch (e) {
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
      { id: uuidv4(), type: 'categoryBreakdown' },
      { id: uuidv4(), type: 'recentTransactions' },
    ];
    setWidgets(initialWidgets);
    const initialLgLayout = initialWidgets.map((widget, index) => ({
      i: widget.id,
      x: (index % 2) * 6,
      y: Math.floor(index / 2) * 6,
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
        console.error('Failed to save dashboard layout', e);
      }
    } else if (isMounted && widgets.length === 0) {
      localStorage.removeItem(LAYOUT_STORAGE_KEY);
    }
  }, [layouts, widgets, isMounted]);

  // --- Fetch ALL Expenses ---
  useEffect(() => {
    const fetchExpenses = async () => {
      if (!userId) return;
      setIsLoadingData(true);
      try {
        const response = await axios.get(`${API_URL}/expenses/${userId}`);
        setAllExpenses(response.data || []);
      } catch (error) {
        console.error('Failed to load expenses', error);
        setAllExpenses([]);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchExpenses();
  }, [userId]);

  // --- Filter Expenses Based on Time Period ---
  const filteredExpenses = useMemo(() => {
    if (!timePeriod || (!timePeriod.startDate && !timePeriod.endDate)) {
      return allExpenses;
    }
    if (!timePeriod.startDate || !timePeriod.endDate) {
      console.warn('Incomplete time period:', timePeriod);
      return [];
    }

    const interval = {
      start: timePeriod.startDate,
      end: timePeriod.endDate,
    };

    return allExpenses.filter((expense) => {
      try {
        const expenseDate = parseISO(expense.date);
        return isWithinInterval(expenseDate, interval);
      } catch (e) {
        console.error('Error parsing expense date for filtering:', expense.date, e);
        return false;
      }
    });
  }, [allExpenses, timePeriod]);
  // --- End Filter Expenses ---

  // --- Layout Change Handler ---
  const handleLayoutChange = useCallback(
    (layout, allLayouts) => {
      if (isMounted) {
        setLayouts(allLayouts);
      }
    },
    [isMounted]
  );

  // --- Add Widget Handler ---
  const handleAddWidget = useCallback((widgetType) => {
    const widgetConfig = WIDGET_COMPONENTS[widgetType];
    if (!widgetConfig) return;
    const newWidget = { id: uuidv4(), type: widgetType };
    setWidgets((prev) => [...prev, newWidget]);
    setLayouts((prevLayouts) => {
      const newLayouts = { ...prevLayouts };
      Object.keys(newLayouts).forEach((breakpoint) => {
        const maxY = Math.max(0, ...newLayouts[breakpoint].map((item) => item.y + item.h));
        newLayouts[breakpoint] = [
          ...newLayouts[breakpoint],
          { i: newWidget.id, x: 0, y: maxY, ...widgetConfig.defaultLayout },
        ];
      });
      if (Object.keys(newLayouts).length === 0) {
        newLayouts['lg'] = [{ i: newWidget.id, x: 0, y: 0, ...widgetConfig.defaultLayout }];
      }
      return newLayouts;
    });
  }, []);

  // --- Remove Widget Handler ---
  const handleRemoveWidget = useCallback((widgetIdToRemove) => {
    setWidgets((prev) => prev.filter((widget) => widget.id !== widgetIdToRemove));
    setLayouts((prevLayouts) => {
      const newLayouts = {};
      Object.keys(prevLayouts).forEach((breakpoint) => {
        newLayouts[breakpoint] = prevLayouts[breakpoint].filter((item) => item.i !== widgetIdToRemove);
      });
      return newLayouts;
    });
  }, []);

  // --- Render Widgets ---
  const renderWidgets = () => {
    return widgets.map((widget) => {
      const config = WIDGET_COMPONENTS[widget.type];
      if (!config) {
        console.warn(`Widget type "${widget.type}" not found.`);
        return null;
      }
      const WidgetComponent = config.component;
      return (
        <div key={widget.id} className="widget-grid-item">
          <WidgetWrapper
            titleKey={config.titleKey}
            widgetId={widget.id}
            onRemoveWidget={handleRemoveWidget}
          >
            <WidgetComponent expenses={filteredExpenses} isLoading={isLoadingData} userId={userId} />
          </WidgetWrapper>
        </div>
      );
    });
  };
  // --- End Render Widgets ---

  // --- Main Return ---
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h1">
          <T>dynamicDashboard.title</T>
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddWidgetDialogOpen(true)}
        >
          <T>dynamicDashboard.addWidget</T>
        </Button>
      </Box>

      {/* --- Render Time Period Selector ABOVE the grid --- */}
      <TimePeriodSelectorWidget
        initialPeriod="currentMonth"
        onPeriodChange={setTimePeriod}
      />
      {/* --- End Time Period Selector --- */}

      {/* Grid Rendering Logic */}
      {!isMounted ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : widgets.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 5,
            border: '1px dashed grey',
            borderRadius: 1,
            minHeight: 200,
          }}
        >
          <Typography color="text.secondary">
            <T>dynamicDashboard.emptyDashboard</T>
          </Typography>
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
          // --- Add draggableCancel to prevent drag on remove button ---
          draggableCancel={WIDGET_REMOVE_SELECTOR}
          // --- Optional: Uncomment if using drag handle in WidgetWrapper ---
          // draggableHandle=".widget-drag-handle"
        >
          {renderWidgets()}
        </ResponsiveGridLayout>
      )}
      {/* End Grid Rendering Logic */}

      <AddWidgetDialog
        open={isAddWidgetDialogOpen}
        onClose={() => setIsAddWidgetDialogOpen(false)}
        onAddWidget={handleAddWidget}
      />
    </Container>
  );
  // --- End Main Return ---
}
// src/modules/DynamicDashboard/DynamicDashboard.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Box, Button, Container, CircularProgress, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { parseISO, isWithinInterval, startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, isValid } from 'date-fns';

// --- Import Widgets ---
import WidgetWrapper from './widgets/WidgetWrapper';
import OverviewSummaryWidget from './widgets/OverviewSummaryWidget';
import CategoryBreakdownWidget from './widgets/CategoryBreakdownWidget';
import RecentTransactionsWidget from './widgets/RecentTransactionsWidget';
import ExpenseTrendWidget from './widgets/ExpenseTrendWidget';
import MonthlyComparisonWidget from './widgets/MonthlyComparisonWidget';
import TimePeriodSelectorWidget from './widgets/TimePeriodSelectorWidget';
// --- Import NEW Widgets ---
import TopSpendingCategoriesWidget from './widgets/TopSpendingCategoriesWidget';
import LargestExpensesWidget from './widgets/LargestExpensesWidget';
import AverageDailySpendWidget from './widgets/AverageDailySpendWidget';
import CategorySpendingTimelineWidget from './widgets/CategorySpendingTimelineWidget';
import SpendingGoalTrackerWidget from './widgets/SpendingGoalTrackerWidget'; // Suggested
// --- End Import Widgets ---

import AddWidgetDialog from './AddWidgetDialog';
import T from '../../utils/T';

const ResponsiveGridLayout = WidthProvider(Responsive);
const API_URL = 'http://localhost:8000';
const LAYOUT_STORAGE_KEY = 'dynamicDashboardLayout_v1';
const WIDGET_REMOVE_SELECTOR = '.widget-remove-button';

const WIDGET_COMPONENTS = {
  // --- Existing Widgets ---
  overviewSummary: { component: OverviewSummaryWidget, titleKey: 'dynamicDashboard.overviewSummary', defaultLayout: { w: 4, h: 3, minW: 3, minH: 3 } },
  categoryBreakdown: { component: CategoryBreakdownWidget, titleKey: 'dynamicDashboard.categoryBreakdown', defaultLayout: { w: 4, h: 6, minW: 3, minH: 5 } },
  recentTransactions: { component: RecentTransactionsWidget, titleKey: 'dynamicDashboard.recentTransactions', defaultLayout: { w: 4, h: 6, minW: 3, minH: 5 } },
  expenseTrend: { component: ExpenseTrendWidget, titleKey: 'dynamicDashboard.expenseTrend', defaultLayout: { w: 6, h: 6, minW: 4, minH: 4 } },
  monthlyComparison: { component: MonthlyComparisonWidget, titleKey: 'dynamicDashboard.monthlyComparison', defaultLayout: { w: 6, h: 6, minW: 4, minH: 4 } },
  // --- NEW Widgets ---
  topSpendingCategories: { component: TopSpendingCategoriesWidget, titleKey: 'dynamicDashboard.topSpendingCategories', defaultLayout: { w: 4, h: 6, minW: 3, minH: 5 } },
  largestExpenses: { component: LargestExpensesWidget, titleKey: 'dynamicDashboard.largestExpenses', defaultLayout: { w: 4, h: 6, minW: 3, minH: 5 } },
  averageDailySpend: { component: AverageDailySpendWidget, titleKey: 'dynamicDashboard.averageDailySpend', defaultLayout: { w: 4, h: 3, minW: 3, minH: 3 } },
  categorySpendingTimeline: { component: CategorySpendingTimelineWidget, titleKey: 'dynamicDashboard.categorySpendingTimeline', defaultLayout: { w: 8, h: 7, minW: 5, minH: 5 } },
  spendingGoalTracker: { component: SpendingGoalTrackerWidget, titleKey: 'dynamicDashboard.spendingGoal', defaultLayout: { w: 4, h: 5, minW: 3, minH: 4 } }, // Suggested
};

// --- Helper to get initial dates for a preset ---
const getInitialDatesForPreset = (presetKey) => {
    // ... (same as before)
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
    // Initialize timePeriod state simply, will be set by selector's useEffect
    const [timePeriod, setTimePeriod] = useState({ startDate: null, endDate: null });
  // --- End State ---

  // --- Load Layout ---
  useEffect(() => {
    const savedData = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            if (parsedData.widgets && parsedData.layouts) {
                // Filter out widgets whose type no longer exists in WIDGET_COMPONENTS
                const validWidgets = parsedData.widgets.filter(w => WIDGET_COMPONENTS[w.type]);
                const validLayouts = {};
                Object.keys(parsedData.layouts).forEach(bp => {
                    // Filter layout items to only include those corresponding to valid widgets
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
      { id: uuidv4(), type: 'categoryBreakdown' },
      { id: uuidv4(), type: 'recentTransactions' },
      { id: uuidv4(), type: 'expenseTrend' },
    ];
    setWidgets(initialWidgets);
    const initialLgLayout = initialWidgets.map((widget, index) => ({
      i: widget.id,
      x: (index % 3) * 4, // Adjust layout for potentially 3 columns
      y: Math.floor(index / 3) * 6, // Adjust row placement
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
        // Remove layout from storage if dashboard becomes empty
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
        console.error("Failed to load expenses", error);
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
            console.warn("Incomplete time period:", timePeriod);
            return [];
        }
        const interval = { start: timePeriod.startDate, end: timePeriod.endDate };
        return allExpenses.filter(expense => {
            try {
                const expenseDate = parseISO(expense.date);
                // --- Now isValid will be defined and the error should be gone ---
                return isValid(expenseDate) && isWithinInterval(expenseDate, interval);
            } catch (e) {
                console.error("Error parsing expense date for filtering:", expense.date, e);
                return false;
            }
        });
    }, [allExpenses, timePeriod]);
  // --- End Filter Expenses ---

  // --- Layout Change Handler ---
  const handleLayoutChange = useCallback((layout, allLayouts) => {
    // Only update layout state if the component is mounted and the layout has actually changed
    // This check prevents unnecessary saves during initial render or minor adjustments
    if (isMounted && JSON.stringify(allLayouts) !== JSON.stringify(layouts)) {
        setLayouts(allLayouts);
    }
  }, [isMounted, layouts]); // Added layouts dependency

  // --- Add Widget Handler ---
  const handleAddWidget = useCallback((widgetType) => {
    const widgetConfig = WIDGET_COMPONENTS[widgetType]; if (!widgetConfig) return;
    const newWidget = { id: uuidv4(), type: widgetType };
    setWidgets(prev => [...prev, newWidget]);

    // Add the new widget layout to all existing breakpoint layouts
    setLayouts(prevLayouts => {
        const newLayouts = { ...prevLayouts };
        Object.keys(newLayouts).forEach(breakpoint => {
            // Find the lowest point (maxY) in the current layout to place the new widget
            const maxY = Math.max(0, ...newLayouts[breakpoint].map(item => item.y + item.h));
            newLayouts[breakpoint] = [
                ...newLayouts[breakpoint],
                { i: newWidget.id, x: 0, y: maxY, ...widgetConfig.defaultLayout } // Place at (0, maxY)
            ];
        });
        // If layouts were initially empty, create the 'lg' breakpoint layout
        if (Object.keys(newLayouts).length === 0) {
             newLayouts['lg'] = [{ i: newWidget.id, x: 0, y: 0, ...widgetConfig.defaultLayout }];
        }
        return newLayouts;
    });
  }, []); // Removed layouts from dependency array as it's updated via setWidgets/setLayouts

  // --- Remove Widget Handler ---
  const handleRemoveWidget = useCallback((widgetIdToRemove) => {
    setWidgets(prev => prev.filter(widget => widget.id !== widgetIdToRemove));
    // Also remove the layout item for the removed widget from all breakpoints
    setLayouts(prevLayouts => {
        const newLayouts = {};
        Object.keys(prevLayouts).forEach(breakpoint => {
            newLayouts[breakpoint] = prevLayouts[breakpoint].filter(item => item.i !== widgetIdToRemove);
        });
        return newLayouts;
    });
  }, []); // Removed layouts from dependency array

  // --- Render Widgets ---
  const renderWidgets = () => {
    return widgets.map((widget) => {
      const config = WIDGET_COMPONENTS[widget.type];
      if (!config) { console.warn(`Widget type "${widget.type}" not found.`); return null; }
      const WidgetComponent = config.component;
      return (
        <div key={widget.id} className="widget-grid-item"> {/* Ensure this class exists if needed by global.css */}
          <WidgetWrapper
            titleKey={config.titleKey}
            widgetId={widget.id}
            onRemoveWidget={handleRemoveWidget} // Pass the handler
          >
            {/* Pass FILTERED expenses and loading state */}
            <WidgetComponent
                expenses={filteredExpenses}
                isLoading={isLoadingData}
                userId={userId} // Pass userId if needed by specific widgets (e.g., for settings/goals later)
            />
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
          <Typography variant="h5" component="h1"> <T>dynamicDashboard.title</T> </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsAddWidgetDialogOpen(true)} > <T>dynamicDashboard.addWidget</T> </Button>
      </Box>

       <TimePeriodSelectorWidget
            onPeriodChange={setTimePeriod}
       />

       {!isMounted ? ( <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
       ) : widgets.length === 0 ? ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 5, border: '1px dashed grey', borderRadius: 1, minHeight: 200 }}> <Typography color="text.secondary"> <T>dynamicDashboard.emptyDashboard</T> </Typography> </Box>
       ) : (
           <ResponsiveGridLayout
               className="layout" layouts={layouts}
               breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
               cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
               rowHeight={50} margin={[15, 15]} containerPadding={[10, 10]}
               onLayoutChange={handleLayoutChange}
               isDraggable isResizable
               draggableCancel={WIDGET_REMOVE_SELECTOR}
           >
               {renderWidgets()}
           </ResponsiveGridLayout>
       )}

     <AddWidgetDialog
        open={isAddWidgetDialogOpen}
        onClose={() => setIsAddWidgetDialogOpen(false)}
        onAddWidget={handleAddWidget}
      />
    </Container>
  );
  // --- End Main Return ---
}

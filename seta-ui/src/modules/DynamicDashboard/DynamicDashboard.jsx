// src/modules/DynamicDashboard/DynamicDashboard.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Box, Button, Container, CircularProgress, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { parseISO, isWithinInterval, startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, isValid } from 'date-fns';

// --- Existing Widget Imports ---
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
import SpendingGoalTrackerWidget from './widgets/SpendingGoalTrackerWidget';
import FilterWidget from './widgets/FilterWidget';
// --- Import NEW Placeholder Widgets ---
import UpcomingBillsWidget from './widgets/UpcomingBillsWidget';
import BudgetOverviewWidget from './widgets/BudgetOverviewWidget';
import MiniCalendarWidget from './widgets/MiniCalendarWidget';
import GoalProgressWidget from './widgets/GoalProgressWidget';
import NetCashFlowWidget from './widgets/NetCashFlowWidget';
import AccountBalanceWidget from './widgets/AccountBalanceWidget';
// --- End Import Widgets ---

import AddWidgetDialog from './AddWidgetDialog';
import T from '../../utils/T';

// --- Keep Constants ---
const ResponsiveGridLayout = WidthProvider(Responsive);
const API_URL = 'http://localhost:8000';
const LAYOUT_STORAGE_KEY = 'dynamicDashboardLayout_v2'; // <-- Increment version if layout structure changes significantly
const WIDGET_REMOVE_SELECTOR = '.widget-remove-button';
const WIDGET_DRAG_HANDLE_SELECTOR = '.widget-drag-handle';

const DEFAULT_MAX_AMOUNT = 1000;

const DEFAULT_FILTERS = {
    categories: [],
    amountRange: [0, DEFAULT_MAX_AMOUNT]
};

// --- Updated WIDGET_COMPONENTS ---
const WIDGET_COMPONENTS = {
  // Existing Widgets (keep adjusted layouts)
  overviewSummary: { component: OverviewSummaryWidget, titleKey: 'dynamicDashboard.overviewSummary', defaultLayout: { w: 4, h: 3, minW: 2, minH: 2 } },
  filterWidget: { component: FilterWidget, titleKey: 'dynamicDashboard.filterWidgetTitle', defaultLayout: { w: 3, h: 5, minW: 2, minH: 4, isResizable: true } },
  categoryBreakdown: { component: CategoryBreakdownWidget, titleKey: 'dynamicDashboard.categoryBreakdown', defaultLayout: { w: 4, h: 6, minW: 3, minH: 4 } },
  recentTransactions: { component: RecentTransactionsWidget, titleKey: 'dynamicDashboard.recentTransactions', defaultLayout: { w: 4, h: 6, minW: 2, minH: 3 } },
  expenseTrend: { component: ExpenseTrendWidget, titleKey: 'dynamicDashboard.expenseTrend', defaultLayout: { w: 6, h: 6, minW: 3, minH: 3 } },
  monthlyComparison: { component: MonthlyComparisonWidget, titleKey: 'dynamicDashboard.monthlyComparison', defaultLayout: { w: 6, h: 6, minW: 3, minH: 3 } },
  topSpendingCategories: { component: TopSpendingCategoriesWidget, titleKey: 'dynamicDashboard.topSpendingCategories', defaultLayout: { w: 4, h: 6, minW: 2, minH: 3 } },
  largestExpenses: { component: LargestExpensesWidget, titleKey: 'dynamicDashboard.largestExpenses', defaultLayout: { w: 4, h: 6, minW: 2, minH: 3 } },
  averageDailySpend: { component: AverageDailySpendWidget, titleKey: 'dynamicDashboard.averageDailySpend', defaultLayout: { w: 4, h: 3, minW: 2, minH: 2 } },
  categorySpendingTimeline: { component: CategorySpendingTimelineWidget, titleKey: 'dynamicDashboard.categorySpendingTimeline', defaultLayout: { w: 8, h: 7, minW: 4, minH: 4 } },
  spendingGoalTracker: { component: SpendingGoalTrackerWidget, titleKey: 'dynamicDashboard.spendingGoal', defaultLayout: { w: 4, h: 5, minW: 2, minH: 3 } },
  // --- NEW Widgets ---
  upcomingBills: {
    component: UpcomingBillsWidget,
    titleKey: 'dynamicDashboard.upcomingBillsTitle',
    defaultLayout: { w: 4, h: 5, minW: 2, minH: 3 } // List-like
  },
  budgetOverview: {
    component: BudgetOverviewWidget,
    titleKey: 'dynamicDashboard.budgetOverviewTitle',
    defaultLayout: { w: 5, h: 6, minW: 3, minH: 4 } // Needs space for bars/summaries
  },
  miniCalendar: {
    component: MiniCalendarWidget,
    titleKey: 'dynamicDashboard.miniCalendarTitle',
    defaultLayout: { w: 4, h: 6, minW: 3, minH: 4 } // Squarish
  },
  goalProgress: {
    component: GoalProgressWidget,
    titleKey: 'dynamicDashboard.goalProgressTitle',
    defaultLayout: { w: 4, h: 5, minW: 2, minH: 3 } // Similar to goal tracker
  },
  netCashFlow: {
    component: NetCashFlowWidget,
    titleKey: 'dynamicDashboard.netCashFlowTitle',
    defaultLayout: { w: 4, h: 3, minW: 2, minH: 2 } // Simple summary
  },
  accountBalance: {
    component: AccountBalanceWidget,
    titleKey: 'dynamicDashboard.accountBalanceTitle',
    defaultLayout: { w: 5, h: 5, minW: 3, minH: 3 } // Might show multiple accounts
  },
};
// --- End Constants ---


export default function DynamicDashboard() {
    const { t } = useTranslation();
    const userId = localStorage.getItem('userId');

    // --- State (Keep existing state) ---
    const [layouts, setLayouts] = useState({});
    const [widgets, setWidgets] = useState([]);
    const [allExpenses, setAllExpenses] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(false); // Primarily for expenses now
    const [isAddWidgetDialogOpen, setIsAddWidgetDialogOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [timePeriod, setTimePeriod] = useState({ startDate: null, endDate: null });
    const [activeFilters, setActiveFilters] = useState(DEFAULT_FILTERS);
    // --- End State ---

    // --- Load Layout (Keep existing logic) ---
    useEffect(() => {
        const savedData = localStorage.getItem(LAYOUT_STORAGE_KEY);
        if (savedData) { try { const parsedData = JSON.parse(savedData); if (parsedData.widgets && parsedData.layouts) { const validWidgets = parsedData.widgets.filter(w => WIDGET_COMPONENTS[w.type]); const validLayouts = {}; Object.keys(parsedData.layouts).forEach(bp => { validLayouts[bp] = parsedData.layouts[bp].filter(l => validWidgets.some(w => w.id === l.i)); }); setWidgets(validWidgets); setLayouts(validLayouts); } else { initializeDefaultLayout(); } } catch (e) { console.error("Failed to parse saved layout", e); initializeDefaultLayout(); } } else { initializeDefaultLayout(); }
        setIsMounted(true);
    }, []);

    // --- Initialize Default (Keep existing logic) ---
    const initializeDefaultLayout = () => {
        // Maybe include some of the new widgets by default? Example:
        const initialWidgets = [
            { id: uuidv4(), type: 'overviewSummary' },
            { id: uuidv4(), type: 'categoryBreakdown' },
            { id: uuidv4(), type: 'recentTransactions' },
            { id: uuidv4(), type: 'expenseTrend' },
            // { id: uuidv4(), type: 'upcomingBills' }, // Example: Add upcoming bills by default
            // { id: uuidv4(), type: 'miniCalendar' }, // Example: Add mini calendar by default
        ];
        setWidgets(initialWidgets);
        const initialLgLayout = initialWidgets.map((widget, index) => ({
            i: widget.id,
            x: (index % 3) * 4, // Adjust layout algorithm if more defaults are added
            y: Math.floor(index / 3) * 6,
            ...WIDGET_COMPONENTS[widget.type].defaultLayout,
        }));
        setLayouts({ lg: initialLgLayout });
    };

    // --- Save Layout (Keep existing logic) ---
    useEffect(() => {
        if (isMounted && widgets.length > 0) { try { const dataToSave = JSON.stringify({ layouts, widgets }); localStorage.setItem(LAYOUT_STORAGE_KEY, dataToSave); } catch (e) { console.error("Failed to save dashboard layout", e); } } else if (isMounted && widgets.length === 0) { localStorage.removeItem(LAYOUT_STORAGE_KEY); }
    }, [layouts, widgets, isMounted]);

    // --- Fetch ALL Expenses (Keep existing logic) ---
    // Note: Other data (recurring, budgets, etc.) will be fetched within individual widgets
    useEffect(() => {
        const fetchExpenses = async () => { if (!userId) return; setIsLoadingData(true); try { const response = await axios.get(`${API_URL}/expenses/${userId}`); setAllExpenses(response.data || []); } catch (error) { console.error("Failed to load expenses", error); setAllExpenses([]); /* TODO: Show error to user */ } finally { setIsLoadingData(false); } }; fetchExpenses();
    }, [userId]);

    // --- Calculate Time-Period Filtered Expenses (Keep existing logic) ---
    const timePeriodFilteredExpenses = useMemo(() => {
        let expensesToFilter = allExpenses;
        if (timePeriod && (timePeriod.startDate || timePeriod.endDate)) {
            if (timePeriod.startDate && timePeriod.endDate) {
                const interval = { start: timePeriod.startDate, end: timePeriod.endDate };
                expensesToFilter = expensesToFilter.filter(expense => {
                    try {
                        const expenseDate = parseISO(expense.date);
                        return isValid(expenseDate) && isWithinInterval(expenseDate, interval);
                    } catch (e) { return false; }
                });
            } else {
                 // If only one date is set, maybe default to showing nothing or handle differently?
                 // For now, require both dates for custom range filtering.
                 // Presets handle their own ranges. 'All time' uses allExpenses.
                 if (timePeriod.startDate && !timePeriod.endDate) expensesToFilter = []; // Or handle as needed
                 if (!timePeriod.startDate && timePeriod.endDate) expensesToFilter = []; // Or handle as needed
            }
        }
        return expensesToFilter;
    }, [allExpenses, timePeriod]);

    // --- Calculate Max Amount (Keep existing logic) ---
    const maxExpenseAmount = useMemo(() => {
        if (!timePeriodFilteredExpenses || timePeriodFilteredExpenses.length === 0) {
            return DEFAULT_MAX_AMOUNT;
        }
        const max = timePeriodFilteredExpenses.reduce((maxVal, expense) => {
            const amount = parseFloat(expense.amount) || 0;
            return Math.max(maxVal, amount);
        }, 0);
        return Math.max(max, 100);
    }, [timePeriodFilteredExpenses]);

    // --- Apply Active Filters (Keep existing logic) ---
    const filteredExpenses = useMemo(() => {
        let expensesToFilter = timePeriodFilteredExpenses; // Start with time-period filtered

        // Category Filter
        if (activeFilters.categories && activeFilters.categories.length > 0) {
            expensesToFilter = expensesToFilter.filter(expense =>
                activeFilters.categories.includes(expense.category_name)
            );
        }

        // Amount Range Filter
        if (activeFilters.amountRange) {
            const [minAmount, maxAmount] = activeFilters.amountRange;
            expensesToFilter = expensesToFilter.filter(expense => {
                const amount = parseFloat(expense.amount) || 0;
                return amount >= minAmount && amount <= maxAmount;
            });
        }

        return expensesToFilter;

    }, [timePeriodFilteredExpenses, activeFilters]);
    // --- End Filter Expenses ---

    // --- Layout Change Handler (Keep existing logic) ---
    const handleLayoutChange = useCallback((layout, allLayouts) => {
        // Prevent updates during initial mount before layout is stable
        if (isMounted && JSON.stringify(allLayouts) !== JSON.stringify(layouts)) {
             setLayouts(allLayouts);
        }
    }, [isMounted, layouts]);


    // --- Add/Remove Widget Helpers (Keep existing logic) ---
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
        setWidgets(prev => prev.filter(widget => widget.id !== widgetInstanceId));
        setLayouts(prevLayouts => {
            const newLayouts = {};
            Object.keys(prevLayouts).forEach(breakpoint => {
                newLayouts[breakpoint] = prevLayouts[breakpoint].filter(item => item.i !== widgetInstanceId);
            });
            return newLayouts;
        });
    }, []);

    // --- Handler for Dialog Apply Changes (Keep existing logic) ---
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
                     if (widgetType === 'filterWidget') {
                         setActiveFilters({ // Reset filters if filter widget removed
                             categories: [],
                             amountRange: [0, maxExpenseAmount]
                         });
                     }
                }
            }
        });
    }, [widgets, addSingleWidget, removeSingleWidget, maxExpenseAmount]); // Added maxExpenseAmount dependency

    // --- Callback for Filter Widget (Keep existing logic) ---
    const handleFilterChange = useCallback((newFilters) => {
        const adjustedRange = [...newFilters.amountRange];
        if (adjustedRange[1] > maxExpenseAmount) adjustedRange[1] = maxExpenseAmount;
        if (adjustedRange[0] > adjustedRange[1]) adjustedRange[0] = adjustedRange[1];
        setActiveFilters(prev => ({
             ...prev,
             categories: newFilters.categories,
             amountRange: adjustedRange
        }));
    }, [maxExpenseAmount]);
    // --- End Callback ---


    // --- Render Widgets (Logic remains the same, passes standard props) ---
    const renderWidgets = () => {
        return widgets.map((widget) => {
            const config = WIDGET_COMPONENTS[widget.type];
            if (!config) {
                console.warn(`Widget config not found for type: ${widget.type}`);
                return null; // Skip rendering if config is missing
            }
            const WidgetComponent = config.component;

            // Props passed down to ALL widgets
            const commonWidgetProps = {
                // Pass filtered expenses relevant to the time period and filters
                expenses: filteredExpenses,
                // Pass the global loading state (primarily for initial expense load)
                // Individual widgets might have their own internal loading states
                isLoading: isLoadingData,
                userId: userId,
                // Pass the current time period and filters if widgets need them directly
                timePeriod: timePeriod,
                activeFilters: activeFilters,
            };

            // Specific props for the FilterWidget
            const extraProps = widget.type === 'filterWidget'
                ? {
                      onFilterChange: handleFilterChange,
                      initialFilters: activeFilters,
                      maxAmount: maxExpenseAmount
                  }
                : {};

             // --- Pass remove callback to WidgetWrapper ---
             const handleRemoveThisWidget = () => removeSingleWidget(widget.id);


            return (
                // Use the unique widget instance ID (widget.id) as the key for the grid item div
                <div key={widget.id} className="widget-grid-item">
                     {/* Pass the widget instance ID and remove callback */}
                    <WidgetWrapper
                        titleKey={config.titleKey}
                        widgetId={widget.id}
                        onRemoveWidget={handleRemoveThisWidget}
                    >
                        <WidgetComponent
                            {...commonWidgetProps} // Spread common props
                            {...extraProps}      // Spread specific props
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
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsAddWidgetDialogOpen(true)} >
                    <T>dynamicDashboard.manageWidgets</T>
                </Button>
            </Box>

            {/* Time Period Selector remains outside the grid */}
            <TimePeriodSelectorWidget onPeriodChange={setTimePeriod} />

            {!isMounted ? ( <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
            ) : widgets.length === 0 ? ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 5, border: '1px dashed grey', borderRadius: 1, minHeight: 200 }}> <Typography color="text.secondary"> <T>dynamicDashboard.emptyDashboard</T> </Typography> </Box>
            ) : (
                <ResponsiveGridLayout
                    className="layout"
                    layouts={layouts}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    rowHeight={50} // Adjust base row height if needed
                    margin={[15, 15]}
                    containerPadding={[10, 10]}
                    onLayoutChange={handleLayoutChange}
                    isDraggable
                    isResizable
                    draggableCancel={WIDGET_REMOVE_SELECTOR} // Class to prevent dragging
                    draggableHandle={WIDGET_DRAG_HANDLE_SELECTOR} // Class for the drag handle (on WidgetWrapper header)
                    useCSSTransforms={true} // Generally smoother performance
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
    // --- End Main Return ---
}

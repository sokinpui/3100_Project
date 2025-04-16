// src/modules/DynamicDashboard/DynamicDashboard.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Box, Button, Container, CircularProgress, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { parseISO, isWithinInterval, startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, isValid } from 'date-fns';

// --- Keep Widget Imports ---
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
// --- End Import Widgets ---

import AddWidgetDialog from './AddWidgetDialog';
import T from '../../utils/T';

// --- Keep Constants ---
const ResponsiveGridLayout = WidthProvider(Responsive);
const API_URL = 'http://localhost:8000';
const LAYOUT_STORAGE_KEY = 'dynamicDashboardLayout_v1';
const WIDGET_REMOVE_SELECTOR = '.widget-remove-button';
const WIDGET_DRAG_HANDLE_SELECTOR = '.widget-drag-handle';

const DEFAULT_MAX_AMOUNT = 1000;

const WIDGET_COMPONENTS = {
  overviewSummary: {
    component: OverviewSummaryWidget,
    titleKey: 'dynamicDashboard.overviewSummary',
    // Reduced min size - allows smaller display
    defaultLayout: { w: 4, h: 3, minW: 2, minH: 2 }
  },
  categoryBreakdown: {
    component: CategoryBreakdownWidget,
    titleKey: 'dynamicDashboard.categoryBreakdown',
    // Keep chart min size reasonable
    defaultLayout: { w: 4, h: 6, minW: 3, minH: 4 }
  },
  recentTransactions: {
    component: RecentTransactionsWidget,
    titleKey: 'dynamicDashboard.recentTransactions',
    // Allow list to be narrower and shorter
    defaultLayout: { w: 4, h: 6, minW: 2, minH: 3 }
  },
  expenseTrend: {
    component: ExpenseTrendWidget,
    titleKey: 'dynamicDashboard.expenseTrend',
    // Keep chart min size reasonable
    defaultLayout: { w: 6, h: 6, minW: 3, minH: 3 }
  },
  monthlyComparison: {
    component: MonthlyComparisonWidget,
    titleKey: 'dynamicDashboard.monthlyComparison',
     // Keep chart min size reasonable
    defaultLayout: { w: 6, h: 6, minW: 3, minH: 3 }
  },
  topSpendingCategories: {
    component: TopSpendingCategoriesWidget,
    titleKey: 'dynamicDashboard.topSpendingCategories',
    // Allow table/list to be narrower and shorter
    defaultLayout: { w: 4, h: 6, minW: 2, minH: 3 }
  },
  largestExpenses: {
    component: LargestExpensesWidget,
    titleKey: 'dynamicDashboard.largestExpenses',
     // Allow list to be narrower and shorter
    defaultLayout: { w: 4, h: 6, minW: 2, minH: 3 }
  },
  averageDailySpend: {
    component: AverageDailySpendWidget,
    titleKey: 'dynamicDashboard.averageDailySpend',
     // Reduced min size - allows smaller display
    defaultLayout: { w: 4, h: 3, minW: 2, minH: 2 }
   },
   categorySpendingTimeline: {
     component: CategorySpendingTimelineWidget,
     titleKey: 'dynamicDashboard.categorySpendingTimeline',
     // Keep chart min size reasonable, maybe allow slightly shorter
     defaultLayout: { w: 8, h: 7, minW: 4, minH: 4 }
   },
   spendingGoalTracker: {
     component: SpendingGoalTrackerWidget,
     titleKey: 'dynamicDashboard.spendingGoal',
     // Allow narrower and shorter
     defaultLayout: { w: 4, h: 5, minW: 2, minH: 3 }
   },
   filterWidget: {
       component: FilterWidget,
       titleKey: 'dynamicDashboard.filterWidgetTitle',
       // Adjust default/min size as needed
       defaultLayout: { w: 3, h: 5, minW: 2, minH: 4, isResizable: true } // Filters might not need much height
   },
};
// --- End Constants ---


export default function DynamicDashboard() {
    const { t } = useTranslation();
    const userId = localStorage.getItem('userId');

    // --- State ---
    const [layouts, setLayouts] = useState({});
    const [widgets, setWidgets] = useState([]); // Stores { id: uuid, type: string }[]
    const [allExpenses, setAllExpenses] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isAddWidgetDialogOpen, setIsAddWidgetDialogOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [timePeriod, setTimePeriod] = useState({ startDate: null, endDate: null });
     const [activeFilters, setActiveFilters] = useState({
        categories: [],
        // Initialize range with default max, will be adjusted by FilterWidget based on prop
        amountRange: [0, DEFAULT_MAX_AMOUNT]
    });
    // --- End State ---

    // --- Load Layout ---
    useEffect(() => {
        const savedData = localStorage.getItem(LAYOUT_STORAGE_KEY);
        if (savedData) { try { const parsedData = JSON.parse(savedData); if (parsedData.widgets && parsedData.layouts) { const validWidgets = parsedData.widgets.filter(w => WIDGET_COMPONENTS[w.type]); const validLayouts = {}; Object.keys(parsedData.layouts).forEach(bp => { validLayouts[bp] = parsedData.layouts[bp].filter(l => validWidgets.some(w => w.id === l.i)); }); setWidgets(validWidgets); setLayouts(validLayouts); } else { initializeDefaultLayout(); } } catch (e) { console.error("Failed to parse saved layout", e); initializeDefaultLayout(); } } else { initializeDefaultLayout(); }
        setIsMounted(true);
    }, []);

    // --- Initialize Default ---
    const initializeDefaultLayout = () => {
        const initialWidgets = [ { id: uuidv4(), type: 'overviewSummary' }, { id: uuidv4(), type: 'categoryBreakdown' }, { id: uuidv4(), type: 'recentTransactions' }, { id: uuidv4(), type: 'expenseTrend' }, ]; setWidgets(initialWidgets); const initialLgLayout = initialWidgets.map((widget, index) => ({ i: widget.id, x: (index % 3) * 4, y: Math.floor(index / 3) * 6, ...WIDGET_COMPONENTS[widget.type].defaultLayout, })); setLayouts({ lg: initialLgLayout });
    };

    // --- Save Layout ---
    useEffect(() => {
        if (isMounted && widgets.length > 0) { try { const dataToSave = JSON.stringify({ layouts, widgets }); localStorage.setItem(LAYOUT_STORAGE_KEY, dataToSave); } catch (e) { console.error("Failed to save dashboard layout", e); } } else if (isMounted && widgets.length === 0) { localStorage.removeItem(LAYOUT_STORAGE_KEY); }
    }, [layouts, widgets, isMounted]);

    // --- Fetch ALL Expenses ---
    useEffect(() => {
        const fetchExpenses = async () => { if (!userId) return; setIsLoadingData(true); try { const response = await axios.get(`${API_URL}/expenses/${userId}`); setAllExpenses(response.data || []); } catch (error) { console.error("Failed to load expenses", error); setAllExpenses([]); } finally { setIsLoadingData(false); } }; fetchExpenses();
    }, [userId]);

    // --- Calculate Time-Period Filtered Expenses (intermediate step) ---
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
                expensesToFilter = [];
            }
        }
        return expensesToFilter;
    }, [allExpenses, timePeriod]);

    // --- Calculate Max Amount based on Time-Period Filtered Data ---
    const maxExpenseAmount = useMemo(() => {
        if (!timePeriodFilteredExpenses || timePeriodFilteredExpenses.length === 0) {
            return DEFAULT_MAX_AMOUNT; // Use default if no data in period
        }
        const max = timePeriodFilteredExpenses.reduce((maxVal, expense) => {
            const amount = parseFloat(expense.amount) || 0;
            return Math.max(maxVal, amount);
        }, 0);
        // Ensure a minimum sensible max for the slider if max is very low or 0
        return Math.max(max, 100); // e.g., minimum max of $100
    }, [timePeriodFilteredExpenses]);

    // --- Filter Expenses Based on Time Period ---
    const filteredExpenses = useMemo(() => {
        let expensesToFilter = timePeriodFilteredExpenses; // Start with time-period filtered

        // Category Filter
        if (activeFilters.categories && activeFilters.categories.length > 0) {
            expensesToFilter = expensesToFilter.filter(expense =>
                activeFilters.categories.includes(expense.category_name)
            );
        }

        // Amount Range Filter (using state set by the slider)
        if (activeFilters.amountRange) {
            const [minAmount, maxAmount] = activeFilters.amountRange;
            expensesToFilter = expensesToFilter.filter(expense => {
                const amount = parseFloat(expense.amount) || 0;
                // Ensure maxAmount check uses the value from state, not the calculated max prop
                return amount >= minAmount && amount <= maxAmount;
            });
        }

        return expensesToFilter;

    }, [timePeriodFilteredExpenses, activeFilters]);
    // --- End Filter Expenses ---

    // --- Layout Change Handler ---
    const handleLayoutChange = useCallback((layout, allLayouts) => {
        if (isMounted && JSON.stringify(allLayouts) !== JSON.stringify(layouts)) { setLayouts(allLayouts); }
    }, [isMounted, layouts]);

    // --- Add Widget (Helper Function) ---
    // Adds a single widget type, generating a unique ID
    const addSingleWidget = useCallback((widgetType) => {
        const widgetConfig = WIDGET_COMPONENTS[widgetType];
        if (!widgetConfig) {
            console.warn(`Attempted to add unknown widget type: ${widgetType}`);
            return;
        }
        // Note: This simple version allows multiple widgets of the same type.
        // Add a check here using `widgets.some(w => w.type === widgetType)` if you want to prevent duplicates.

        const newWidget = { id: uuidv4(), type: widgetType }; // Generate unique ID
        console.log("Adding widget:", newWidget); // Debug log
        setWidgets(prev => [...prev, newWidget]);

        // Add layout item for the new widget instance
        setLayouts(prevLayouts => {
            const newLayouts = { ...prevLayouts };
            const breakpoints = Object.keys(prevLayouts).length > 0 ? Object.keys(prevLayouts) : ['lg']; // Default to 'lg' if empty
            breakpoints.forEach(breakpoint => {
                const currentBreakpointLayout = newLayouts[breakpoint] || [];
                const maxY = Math.max(0, ...currentBreakpointLayout.map(item => item.y + item.h));
                newLayouts[breakpoint] = [
                    ...currentBreakpointLayout,
                    // Use the unique newWidget.id for the layout item 'i'
                    { i: newWidget.id, x: 0, y: maxY, ...widgetConfig.defaultLayout }
                ];
            });
            return newLayouts;
        });
    }, []); // Removed widgets dependency unless checking for duplicates

    // --- Remove Widget (Helper Function) ---
    // Removes a widget instance based on its unique ID (UUID)
    const removeSingleWidget = useCallback((widgetInstanceId) => {
        console.log("Removing widget instance ID:", widgetInstanceId); // Debug log
        setWidgets(prev => prev.filter(widget => widget.id !== widgetInstanceId));
        setLayouts(prevLayouts => {
            const newLayouts = {};
            Object.keys(prevLayouts).forEach(breakpoint => {
                newLayouts[breakpoint] = prevLayouts[breakpoint].filter(item => item.i !== widgetInstanceId);
            });
            return newLayouts;
        });
    }, []);

    // --- Handler for Dialog Apply Changes ---
    const handleApplyWidgetChanges = useCallback((desiredStates) => {
        console.log("Applying changes with desired states:", desiredStates); // Debug log
        const currentWidgetsMap = new Map(widgets.map(w => [w.type, w.id])); // Map type to instance ID

        // Determine widgets to add and remove
        Object.entries(desiredStates).forEach(([widgetType, shouldBePresent]) => {
            const isCurrentlyPresent = currentWidgetsMap.has(widgetType);

            if (shouldBePresent && !isCurrentlyPresent) {
                console.log("Decision: Add widget type", widgetType); // Debug log
                addSingleWidget(widgetType);
            } else if (!shouldBePresent && isCurrentlyPresent) {
                const instanceIdToRemove = currentWidgetsMap.get(widgetType);
                console.log(`Decision: Remove widget type ${widgetType} with instance ID ${instanceIdToRemove}`); // Debug log
                if (instanceIdToRemove) {
                     removeSingleWidget(instanceIdToRemove); // Remove using the correct instance ID
                } else {
                    console.error(`Could not find instance ID for widget type ${widgetType} to remove.`);
                }
            }
        });

    }, [widgets, addSingleWidget, removeSingleWidget]);
    // --- End Handler for Dialog Apply Changes ---

    // --- Callback for Filter Widget ---
    const handleFilterChange = useCallback((newFilters) => {
        console.log("Filters updated:", newFilters);
        // Ensure the amount range max doesn't exceed the calculated max for the period
        const adjustedRange = [...newFilters.amountRange];
        if (adjustedRange[1] > maxExpenseAmount) {
            adjustedRange[1] = maxExpenseAmount;
        }
        if (adjustedRange[0] > adjustedRange[1]) { // Ensure min isn't > max
             adjustedRange[0] = adjustedRange[1];
        }

        setActiveFilters(prev => ({
             ...prev,
             categories: newFilters.categories,
             amountRange: adjustedRange
        }));
    }, [maxExpenseAmount]); // Add maxExpenseAmount dependency
    // --- End Callback ---

    // --- Render Widgets ---
    const renderWidgets = () => {
        // console.log("Rendering widgets:", widgets); // Debug log render
        return widgets.map((widget) => {
            const config = WIDGET_COMPONENTS[widget.type];
            if (!config) { console.warn(`Widget type "${widget.type}" not found.`); return null; }
            const WidgetComponent = config.component;

             // --- Pass onFilterChange only to FilterWidget ---
            // Pass specific props to FilterWidget
            const extraProps = widget.type === 'filterWidget'
                ? {
                      onFilterChange: handleFilterChange,
                      initialFilters: activeFilters, // Pass current filters for initialization/sync
                      maxAmount: maxExpenseAmount // <-- Pass the calculated max amount
                  }
                : {};

            return (
                <div key={widget.id} className="widget-grid-item">
                    <WidgetWrapper titleKey={config.titleKey}>
                        <WidgetComponent
                            // Visual widgets get the final filtered list
                            expenses={filteredExpenses}
                            isLoading={isLoadingData}
                            userId={userId}
                            {...extraProps}
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
                    {/* Updated button text */}
                    <T>dynamicDashboard.manageWidgets</T>
                </Button>
            </Box>

            <TimePeriodSelectorWidget onPeriodChange={setTimePeriod} />

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
                    draggableHandle={WIDGET_DRAG_HANDLE_SELECTOR}
                >
                    {renderWidgets()}
                </ResponsiveGridLayout>
            )}

            <AddWidgetDialog
                open={isAddWidgetDialogOpen}
                onClose={() => setIsAddWidgetDialogOpen(false)}
                // REMOVE onAddWidget and onRemoveExistingWidget
                onApplyChanges={handleApplyWidgetChanges} // <-- Pass the new handler
                // Pass current widget types for initial checkbox state
                existingWidgetTypes={widgets.map(w => w.type)}
            />
        </Container>
    );
    // --- End Main Return ---
}

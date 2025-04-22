# Dashboard Widget Documentation

This document describes the individual widgets available for use within the SETA Dynamic Dashboard. Each widget is designed to display specific financial information or provide interactive functionality. They receive filtered data (based on time period and user filters) as props from the main `DynamicDashboard.jsx` component, unless otherwise noted.

---

### WidgetWrapper

*   **File:** `WidgetWrapper.jsx`
*   **Purpose:** This is a structural Higher-Order Component (HOC), not a data widget itself. It wraps each specific data widget to provide a consistent visual frame (MUI Card), including a title, a drag handle (`.widget-drag-handle` class for `react-grid-layout`), and a remove button (`.widget-remove-button` class).
*   **Data Dependencies:** Receives `titleKey` (for translation), `widgetId`, and `onRemoveWidget` callback as props.
*   **Key Features:** Provides standardized header and removal functionality for all widgets within the grid.


---

### Account Balances Widget

*   **File:** `AccountBalanceWidget.jsx`
*   **Purpose:** Displays the estimated current balance for each of the user's accounts.
*   **Data Dependencies:** `userId` (makes its own API calls for `accounts` and `income`), `expenses` (receives time-period filtered expenses from parent), `timePeriod`.
*   **Key Features:**
    *   Fetches all user accounts and income records.
    *   Calculates an *estimated* current balance for each account by starting with the account's `starting_balance` (as of `balance_date`) and adjusting for income and expenses *linked to that account* that occurred *after* the `balance_date`.
    *   Displays a list showing Account Name, Account Type, and the calculated Estimated Balance.
*   **Notes:** The balance is an estimate based on recorded transactions since the account's specified balance date. Requires expenses/income to be linked to accounts (`account_id`) for accuracy.
![Pasted image 20250422131102.png](images/Pasted%20image%2020250422131102.png)

### Account Detail Widget

*   **File:** `AccountDetailWidget.jsx`
*   **Purpose:** Shows a detailed breakdown (estimated balance, period income, period expenses, period net flow) for a single, user-selected account.
*   **Data Dependencies:** `accounts` (for dropdown), `income` (filtered by parent), `expenses` (filtered by parent), `isLoading`.
*   **Key Features:**
    *   Dropdown menu to select an account.
    *   Displays the selected account's name and type.
    *   Shows the estimated current balance (calculated similarly to `AccountBalanceWidget`).
    *   Shows total income, total expenses, and net flow specifically for that account *within the dashboard's selected time period*.
*   **Notes:** Provides a focused view of a single account's activity during the selected period.
![Pasted image 20250422131118.png](images/Pasted%20image%2020250422131118.png)
![Pasted image 20250422131125.png](images/Pasted%20image%2020250422131125.png)
![Pasted image 20250422131135.png](images/Pasted%20image%2020250422131135.png)

---

### Average Daily Income Widget

*   **File:** `AverageDailyIncomeWidget.jsx`
*   **Purpose:** Calculates and displays the average daily income earned over the selected time period.
*   **Data Dependencies:** `income` (filtered by parent), `isLoading`.
*   **Key Features:** Displays a single large value representing the average daily income. Shows the number of days within the data range used for the calculation.
*   **Notes:** Requires at least two days with income data within the period for a meaningful average.
![[Pasted image 20250422132103.png]]

---

### Average Daily Net Flow Widget

*   **File:** `AverageDailyNetFlowWidget.jsx`
*   **Purpose:** Calculates and displays the average daily net cash flow (Income - Expenses) over the selected time period.
*   **Data Dependencies:** `expenses` (filtered), `income` (filtered), `isLoading`.
*   **Key Features:** Displays a single large value, colored green for positive net flow or red for negative. Shows the number of days within the transaction range used for calculation.
*   **Notes:** Requires at least two days with transaction data.
![[Pasted image 20250422131221.png]]

---

### Average Daily Spend Widget

*   **File:** `AverageDailySpendWidget.jsx`
*   **Purpose:** Calculates and displays the average daily expense amount over the selected time period.
*   **Data Dependencies:** `expenses` (filtered), `isLoading`.
*   **Key Features:** Displays a single large value representing the average daily spending. Shows the number of days within the data range used for calculation.
*   **Notes:** Requires at least two days with expense data.
![[Pasted image 20250422131230.png]]

---

### Budget vs. Actual Spending Widget

*   **File:** `BudgetComparisonWidget.jsx`
*   **Purpose:** Allows users to compare their actual spending against a specific budget rule over time.
*   **Data Dependencies:** `budgets`, `expenses` (filtered), `isLoading`.
*   **Key Features:**
    *   Dropdown to select a budget rule (filtered to the selected budget's category).
    *   Displays a Recharts Bar Chart showing budgeted amount vs. actual spending for each period (Month, Quarter, Year) relevant to the budget rule.
    *   Bars representing actual spending are colored green (under budget) or red (over budget).
    *   Custom tooltip shows budgeted amount, actual amount, and over/under amount.
*   **Notes:** Uses translated category and period names. Groups expense data dynamically based on the selected budget's period type (`monthly`, `quarterly`, `yearly`).
![[Pasted image 20250422131706.png]]

---

### Budget Overview Widget

*   **File:** `BudgetOverviewWidget.jsx`
*   **Purpose:** Shows a quick overview of spending progress against multiple budget rules relevant to the selected time period.
*   **Data Dependencies:** `userId` (makes own call for `budgets`), `expenses` (filtered), `timePeriod`.
*   **Key Features:**
    *   Fetches budget rules.
    *   Displays a list of budgets applicable to the current `timePeriod`.
    *   For each budget, shows category name, spent amount vs limit, and a Linear Progress bar.
    *   Progress bar color indicates status (e.g., green=good, yellow=warning, red=over budget).
*   **Notes:** Uses translated category names. Calculates spending *within* the dashboard's selected `timePeriod`.
![[Pasted image 20250422131718.png]]

---

### Category Breakdown Widget

*   **File:** `CategoryBreakdownWidget.jsx`
*   **Purpose:** Visualizes the distribution of expenses across different categories for the selected period.
*   **Data Dependencies:** `expenses` (filtered), `isLoading`.
*   **Key Features:** Displays a Recharts Pie Chart where each slice represents an expense category's total spending. Includes a legend and a tooltip showing exact amounts.
*   **Notes:** Uses translated category names. Groups expenses by `category_name`.
![[Pasted image 20250422132148.png]]

---

### Category Spending over Time Widget

*   **File:** `CategorySpendingTimelineWidget.jsx`
*   **Purpose:** Shows how spending across different categories evolves month-over-month.
*   **Data Dependencies:** `expenses` (filtered), `isLoading`.
*   **Key Features:** Displays a Recharts stacked Area Chart. Each colored area represents a category's spending per month. Includes a legend and tooltip.
*   **Notes:** Uses translated category names. Aggregates data monthly. Requires at least two months of data for visualization.
![[Pasted image 20250422132227.png]]

---

### Expense Trend Widget

*   **File:** `ExpenseTrendWidget.jsx`
*   **Purpose:** Visualizes the trend of total daily spending over the selected time period.
*   **Data Dependencies:** `expenses` (filtered), `isLoading`.
*   **Key Features:** Displays a Recharts Line Chart plotting the total expense amount for each day. Features an adaptive X-axis (shows fewer labels for longer periods) and a tooltip.
*   **Notes:** Aggregates expenses daily. Requires at least two days of data.
![[Pasted image 20250422131820.png]]
---

### Filter Widget

*   **File:** `FilterWidget.jsx`
*   **Purpose:** Provides interactive controls for users to filter the data displayed in *other* dashboard widgets.
*   **Data Dependencies:** Receives `currentFilters`, `availableCategories` (combined expense categories and income sources), `maxAmount` (calculated max transaction amount in period), `isLoadingData`. Emits changes via `onFilterChange` callback.
*   **Key Features:**
    *   Multi-select dropdown for filtering by expense category and/or income source.
    *   Range slider for filtering transactions by amount.
    *   Uses debouncing for the slider to avoid excessive updates.
*   **Notes:** This widget influences the `filteredExpenses` and `filteredIncome` props passed to other widgets by the parent `DynamicDashboard`. Uses translated category names.
![[Pasted image 20250422131857.png]]
![[Pasted image 20250422131912.png]]
![[Pasted image 20250422131933.png]]

---

### Goal Progress Widget

*   **File:** `GoalProgressWidget.jsx`
*   **Purpose:** Displays the user's progress towards their defined financial goals.
*   **Data Dependencies:** `userId` (makes own call for `goals`).
*   **Key Features:** Fetches goals and displays a list showing Goal Name, Current Amount / Target Amount, and a Linear Progress bar indicating completion percentage.
*   **Notes:** Uses the `current_amount` and `target_amount` directly from the goal data.
![[Pasted image 20250422131944.png]]

---

### Goal Estimate Widget

*   **File:** `GoalTargetDateEstimateWidget.jsx`
*   **Purpose:** Estimates the potential completion date for a selected financial goal based on the average net flow during the dashboard's current time period.
*   **Data Dependencies:** `goals`, `income` (filtered), `expenses` (filtered), `isLoading`, `timePeriod`.
*   **Key Features:**
    *   Dropdown to select a goal.
    *   Calculates the average monthly net flow based on the selected `timePeriod`'s data.
    *   Estimates the number of months needed to reach the goal's remaining amount.
    *   Displays the estimated completion date (Month Year format).
    *   Shows warnings if the goal is already met, has an invalid target, the calculated savings rate is negative/zero, or the estimate is later than an existing target date.
*   **Notes:** The estimation is a simple projection based *only* on the currently selected period's average net flow and may not be accurate for long-term planning.
![[Pasted image 20250422132035.png]]

---

### Income Breakdown Widget

*   **File:** `IncomeBreakdownWidget.jsx`
*   **Purpose:** Visualizes the distribution of income across different sources for the selected period.
*   **Data Dependencies:** `income` (filtered), `isLoading`.
*   **Key Features:** Displays a Recharts Pie Chart where each slice represents an income source's total amount. Includes a legend and tooltip. Handles potential missing source names ('Unknown Source').
*   **Notes:** Groups income by `source`.
![[Pasted image 20250422132317.png]]

---

### Monthly Income Comparison Widget

*   **File:** `IncomeComparisonWidget.jsx`
*   **Purpose:** Compares total income month-over-month within the selected time period.
*   **Data Dependencies:** `income` (filtered), `isLoading`.
*   **Key Features:** Displays a Recharts Bar Chart showing the total income amount for each month.
*   **Notes:** Aggregates income monthly.
![[Pasted image 20250422132347.png]]

---

### Income Trend Widget

*   **File:** `IncomeTrendWidget.jsx`
*   **Purpose:** Visualizes the trend of total daily income over the selected time period.
*   **Data Dependencies:** `income` (filtered), `isLoading`.
*   **Key Features:** Displays a Recharts Line Chart plotting the total income amount for each day. Features an adaptive X-axis and tooltip.
*   **Notes:** Aggregates income daily. Requires at least two days of data.
![[Pasted image 20250422132412.png]]

---

### Largest Expenses Widget

*   **File:** `LargestExpensesWidget.jsx`
*   **Purpose:** Lists the top N largest individual expense transactions within the selected period.
*   **Data Dependencies:** `expenses` (filtered), `isLoading`.
*   **Key Features:** Displays a sorted list showing the description (or translated category name), amount, and date for the highest-value expenses.
*   **Notes:** Limited by `MAX_ITEMS` constant (currently 5). Uses translated category names.
![[Pasted image 20250422132427.png]]

---

### LargestIncomeWidget

*   **File:** `LargestIncomeWidget.jsx`
*   **Purpose:** Lists the top N largest individual income transactions within the selected period.
*   **Data Dependencies:** `income` (filtered), `isLoading`.
*   **Key Features:** Displays a sorted list showing the source, amount, description (if any), and date for the highest-value income items. Includes icons.
*   **Notes:** Limited by `MAX_ITEMS` constant (currently 5).
![[Pasted image 20250422132458.png]]

---

### Spending Calendar Widget

*   **File:** `MiniCalendarWidget.jsx`
*   **Purpose:** Displays a monthly calendar view where each day is colored based on the net cash flow (Income - Expenses) for that specific day.
*   **Data Dependencies:** `expenses` (filtered), `income` (filtered), `timePeriod` (for initial month).
*   **Key Features:**
    *   Grid layout resembling a calendar.
    *   Month navigation arrows (Previous/Next).
    *   Days are colored using a heatmap approach: green intensity for positive net flow, red intensity for negative net flow, relative to the month's maximum absolute daily net flow.
    *   Highlights the current day.
    *   Tooltips on hover show the exact net flow amount for that day.
*   **Notes:** Calculations are performed *per day* within the currently displayed month.
![[Pasted image 20250422133115.png]]

---

### Monthly Comparison Widget

*   **File:** `MonthlyComparisonWidget.jsx`
*   **Purpose:** Compares total expenses month-over-month within the selected time period.
*   **Data Dependencies:** `expenses` (filtered), `isLoading`.
*   **Key Features:** Displays a Recharts Bar Chart showing the total expense amount for each month.
*   **Notes:** Aggregates expenses monthly. Functionally similar to `IncomeComparisonWidget` but for expenses.
![[Pasted image 20250422133141.png]]

---

### Net Cash Flow Widget

*   **File:** `NetCashFlowWidget.jsx`
*   **Purpose:** Displays the overall net cash flow (Total Income - Total Expenses) for the selected dashboard time period.
*   **Data Dependencies:** `userId`, `expenses` (filtered), `timePeriod`. Makes its own API call to fetch `income` (then filters it by `timePeriod`).
*   **Key Features:** Shows a prominent net flow value, colored green (positive) or red (negative). Also displays the total income and total expense values used in the calculation.
*   **Notes:** Provides a key performance indicator for the selected period.
![[Pasted image 20250422133155.png]]

---

### Monthly Net Flow Comparison Widget

*   **File:** `NetFlowComparisonWidget.jsx`
*   **Purpose:** Compares net cash flow month-over-month within the selected time period.
*   **Data Dependencies:** `expenses` (filtered), `income` (filtered), `isLoading`.
*   **Key Features:** Displays a Recharts Bar Chart. Each bar represents a month's net flow. Bars are colored green (positive) or red (negative). Includes a zero reference line.
*   **Notes:** Aggregates income and expenses monthly to calculate net flow per month.
![[Pasted image 20250422133507.png]]

---

### Net Flow Trend Widget

*   **File:** `NetFlowTrendWidget.jsx`
*   **Purpose:** Visualizes the trend of daily net cash flow over the selected time period.
*   **Data Dependencies:** `expenses` (filtered), `income` (filtered), `isLoading`.
*   **Key Features:** Displays a Recharts Line Chart plotting the daily net flow amount. Includes a zero reference line to easily distinguish positive/negative days. Adaptive X-axis.
*   **Notes:** Aggregates income and expenses daily. Requires at least two days of data.
![[Pasted image 20250422133518.png]]

---

### Overview Summary Widget

*   **File:** `OverviewSummaryWidget.jsx`
*   **Purpose:** Presents a high-level summary of key financial figures for the selected period.
*   **Data Dependencies:** `expenses` (filtered), `income` (filtered), `isLoading`.
*   **Key Features:** Displays distinct sections (using Paper components within a Grid) for Total Expenses, Total Income, Net Flow, and potentially total entry counts. Uses icons for visual distinction.
*   **Notes:** Offers a quick snapshot of the user's financial status in the selected period.
![[Pasted image 20250422133540.png]]

---

### Quick Add Transaction Widget

*   **File:** `QuickAddWidget.jsx`
*   **Purpose:** Provides a compact form for quickly adding new expense or income transactions directly from the dashboard.
*   **Data Dependencies:** `userId`. Receives `showNotification` and `onDataAdded` callbacks from the parent. Makes its own `POST` API calls.
*   **Key Features:**
    *   Tabs to switch between Expense and Income forms.
    *   Simplified fields: Amount, Category/Source (dropdown with common options), Date (defaults to today), Description (optional).
    *   Submits data directly to the backend API (`/expenses` or `/income`).
    *   Triggers a data refresh in the parent dashboard via `onDataAdded`.
*   **Notes:** Designed for convenience, not for detailed entry. Uses predefined category/source lists.
![[Pasted image 20250422133657.png]]
![[Pasted image 20250422133704.png]]

---

### Recent Transactions Widget

*   **File:** `RecentTransactionsWidget.jsx`
*   **Purpose:** Displays a chronologically sorted list of the most recent transactions, including both expenses and income.
*   **Data Dependencies:** `expenses` (filtered), `income` (filtered), `isLoading`.
*   **Key Features:**
    *   Combines expense and income data into a single feed.
    *   Sorts transactions by date (most recent first).
    *   Uses icons (up/down arrows) and colors (green/red) to visually differentiate income and expenses.
    *   Shows display name (category/source), amount, description, and date for each item.
*   **Notes:** Limited by `MAX_ITEMS` constant (currently 7). Uses translated category names.
![[Pasted image 20250422133737.png]]

---

### Savings Rate Widget

*   **File:** `SavingsRateWidget.jsx`
*   **Purpose:** Calculates and displays the savings rate for the selected period, defined as (Total Income - Total Expenses) / Total Income.
*   **Data Dependencies:** `expenses` (filtered), `income` (filtered), `isLoading`.
*   **Key Features:**
    *   Displays the calculated savings rate as a percentage.
    *   The percentage value is colored based on the rate (e.g., green for good, yellow for okay, red for negative).
    *   A tooltip shows the underlying total income, total expenses, and net flow values.
*   **Notes:** Handles edge cases like zero income (shows 'N/A' or '-∞%').
![[Pasted image 20250422133755.png]]

---

### Time Period Selector Widget

*   **File:** `TimePeriodSelectorWidget.jsx`
*   **Purpose:** Provides the UI controls for the user to select the time frame for the data displayed across the entire dashboard.
*   **Data Dependencies:** Emits the selected period (`{ startDate, endDate }` or `{ presetKey }`) via the `onPeriodChange` callback. Manages its own state internally and persists the selection to `localStorage`.
*   **Key Features:**
    *   Button displaying the currently selected period (e.g., "Current Month", "Last 30 Days").
    *   Dropdown menu offering preset time ranges (Last 7/30 Days, Current Month/Quarter/Half-Year, All Time).
    *   Allows selecting a "Custom Range", which reveals Date Picker components for start and end dates.
*   **Notes:** This widget is typically placed *outside* the main `react-grid-layout` area but is fundamental to controlling the dashboard's data scope.
![[Pasted image 20250422133810.png]]
![[Pasted image 20250422133818.png]]
![[Pasted image 20250422133827.png]]

---

### Top Income Sources Widget

*   **File:** `TopIncomeSourcesWidget.jsx`
*   **Purpose:** Lists the top N income sources based on the total amount received from each source during the selected period.
*   **Data Dependencies:** `income` (filtered), `isLoading`.
*   **Key Features:** Displays a simple table showing the Source Name and the corresponding Total Amount. Sorted by amount descending.
*   **Notes:** Limited by `MAX_SOURCES` constant (currently 5). Groups income records by `source`. Handles potentially missing source names.
![[Pasted image 20250422133843.png]]

---

### Top Spending Categories Widget

*   **File:** `TopSpendingCategoriesWidget.jsx`
*   **Purpose:** Lists the top N expense categories based on the total amount spent in each category during the selected period.
*   **Data Dependencies:** `expenses` (filtered), `isLoading`.
*   **Key Features:** Displays a simple table showing the translated Category Name and the corresponding Total Amount. Sorted by amount descending.
*   **Notes:** Limited by `MAX_CATEGORIES` constant (currently 5). Uses translated category names. Groups expenses by `category_name`.
![[Pasted image 20250422133854.png]]

---

### Top Unbudgeted Category Widget

*   **File:** `TopUnbudgetedCategoryWidget.jsx`
*   **Purpose:** Identifies the expense category with the highest total spending within the period that *does not* have an associated budget rule defined in the Planning module.
*   **Data Dependencies:** `expenses` (filtered), `budgets`, `isLoading`.
*   **Key Features:**
    *   Displays the name and total spending amount for the top unbudgeted category.
    *   Includes a warning icon.
    *   Provides a button linking to the Planning Manager section (`/planning`) to encourage users to set a budget.
    *   Shows a message if all spending is within budgeted categories or if there's no spending.
*   **Notes:** Requires both expense and budget data to function correctly. Uses translated category names.
![[Pasted image 20250422133935.png]]

---

### Upcoming Bills Widget

*   **File:** `UpcomingBillsWidget.jsx`
*   **Purpose:** Lists recurring expenses that are estimated to be due within a defined upcoming timeframe (e.g., the next 14 days).
*   **Data Dependencies:** `userId` (makes its own API call to fetch `recurring` expense rules).
*   **Key Features:**
    *   Fetches all recurring expense rules.
    *   Uses a helper function (`estimateNextDueDate`) to predict the next occurrence based on the rule's start date and frequency.
    *   Filters these rules to show only those with an estimated next due date within the next `UPCOMING_DAYS`.
    *   Displays a list showing the recurring item's Name, Amount, and estimated Due Date.
*   **Notes:** The accuracy of the "next due date" estimation is basic and might not perfectly handle all scenarios (e.g., complex schedules, end dates).
![[Pasted image 20250422134212.png]]

---

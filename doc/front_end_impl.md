# Frontend Module Documentation

This document provides an overview of the key frontend modules within the `seta-ui` application.

## Authentication Module

### Files

*   `src/login/Login.jsx`
*   `src/login/Signup.jsx`
*   `src/login/AuthGuard.jsx`
*   `src/modules/ResetPassword.jsx`
*   `src/login/Login.css`

### Overview

Handles user authentication, including login, signup, and password reset processes. It also includes an `AuthGuard` component to manage routing based on authentication status.

### Key Components

*   **`Login.jsx`:** Displays the login form, handles user input, interacts with the `/login` API endpoint, manages loading and error states, and stores user session information (`userId`, `username`, etc.) in `localStorage` upon successful login. Includes toggles for theme and language. Handles errors related to inactive or unverified accounts.
*   **`Signup.jsx`:** Displays the registration form, performs client-side validation (password strength, matching, required fields), interacts with the `/signup` API endpoint, and provides feedback on success or failure (e.g., "Check your email for verification"). Includes toggles for theme and language.
*   **`ResetPassword.jsx`:** Component displayed when a user follows a password reset link. Takes the token from the URL, prompts for a new password, validates it, and calls the `/reset-password/{token}` API endpoint.
*   **`AuthGuard.jsx`:** A component that runs on route changes. It checks `localStorage` for authentication status (`userId`) and redirects users accordingly (e.g., non-logged-in users to `/login`, logged-in users away from `/login` or `/signup` towards the dashboard).

### Functionality

*   User Login with username and password. Backend checks if account is active and email is verified.
*   New User Registration with details and **email verification trigger** (backend sends email).
*   Password Reset using a token-based flow initiated via email (request triggered in `Settings.jsx`, reset performed in `ResetPassword.jsx`).
*   Protected Routing: Ensures only authenticated users can access protected modules.
*   Theme and Language selection directly on Login/Signup screens.

### State Management

*   Uses `useState` hooks within each component (`Login`, `Signup`, `ResetPassword`) for form data, loading indicators, error messages, success messages, and password visibility.
*   Relies on `localStorage` to persist authentication status (`userId`, `username`, `email`, `loginTime`) across sessions.
*   Uses `ThemeContext` and `LanguageContext` for managing and persisting theme/language choices.

### API Interaction

*   `POST /login`
*   `POST /signup`
*   `POST /reset-password/{token}`
*   (Password reset *request* is initiated from `Settings.jsx` via `POST /request-password-reset`)

### UI Library

*   Material UI (`Container`, `Paper`, `TextField`, `Button`, `Alert`, `IconButton`, `Avatar`, `CircularProgress`, `Menu`, `MenuItem`, `Tooltip`).

---

## Core Layout & Navigation Module

### Files

*   `src/App.jsx`
*   `src/components/Dashboard/LayoutContainer.jsx`
*   `src/components/Dashboard/ModuleRouter.jsx`
*   `src/components/common/Sidebar.jsx`
*   `src/modulesConfig.js`
*   `src/contexts/ThemeContext.jsx`
*   `src/contexts/LanguageContext.jsx`
*   `src/contexts/ModuleContext.jsx` (Defines basic module structure)
*   `src/services/ApiProvider.jsx`

### Overview

Sets up the main application structure, including routing, the persistent sidebar, global context providers (Theme, Language, API), and the container for displaying feature modules. It also handles visual cues for features requiring specific conditions (like an active licence).

### Key Components

*   **`App.jsx`:** Root component. Initializes context providers (`I18nextProvider`, `ThemeProvider`, `LanguageProvider`, `ApiProvider`, `ModuleProvider`), sets up the `HashRouter`, and renders `AuthGuard` and `LayoutContainer`. Checks initial login status.
*   **`LayoutContainer.jsx`:** A simple wrapper that renders the `ModuleRouter`, effectively defining the main content area next to the sidebar.
*   **`ModuleRouter.jsx`:** Defines application routes based on `modulesConfig.js`. Uses `React Router` (`Routes`, `Route`) and `React.Suspense` for lazy loading components. Wraps protected routes within the `Sidebar` component using a `ProtectedRoute` HOC. Redirects users based on authentication status.
*   **`Sidebar.jsx`:** Persistent sidebar component displayed for authenticated users.
    *   Fetches the user's licence status from the backend (`GET /users/{userId}/licence`).
    *   Renders navigation links based on `sidebarMenuItems` from `modulesConfig.js`.
    *   Conditionally renders or adds visual indicators (e.g., lock icon, tooltip) to menu items that require an active licence (like "Custom Reports"), based on the fetched `licenceStatus` and the `requiresLicence` flag in `modulesConfig.js`.
    *   Includes toggles for theme and language, user profile information display (username/email from `localStorage`), and a logout button with confirmation.
    *   Adapts its width (collapsed/expanded).
*   **`modulesConfig.js`:** Central configuration file defining all application modules (public and protected), their paths, associated components (lazy-loaded), icons, whether they appear in the sidebar, and **whether they require an active licence**.
*   **Context Providers:** (`ThemeProvider`, `LanguageProvider`, `ApiProvider`, `ModuleProvider`) Wrap the application to provide global access to theme, language, API instance, and module definitions.

### Functionality

*   Provides the main application frame (Sidebar + Content Area).
*   Handles routing between different feature modules using `HashRouter`.
*   Lazy loads module components for better initial performance.
*   Protects routes requiring authentication via `AuthGuard` and `ProtectedRoute`.
*   Manages and persists global theme and language settings.
*   Provides a global Axios instance for API calls via `ApiProvider`.
*   Allows users to logout via the Sidebar.
*   **Visually indicates (in the Sidebar) which features require an active licence and restricts access based on fetched licence status.**

### State Management

*   Global theme and language state managed via `ThemeContext` and `LanguageContext`, persisted in `localStorage`.
*   Sidebar uses `useState` for its open/closed state, dialog visibility, and **licence status (`licenceStatus`)**.
*   `AuthGuard` uses `useState` (passed via prop) to signal login status to `App.jsx`.

### API Interaction

*   Primarily facilitates API calls made by child modules through the `ApiProvider` context.
*   **Sidebar fetches licence status: `GET /users/{userId}/licence`**.
*   Sidebar reads user info directly from `localStorage`. Logout clears relevant `localStorage` items.

### UI Library

*   Material UI (`Box`, `Drawer`, `List`, `ListItem`, `ListItemIcon`, `ListItemText`, `Button`, `Dialog`, `Avatar`, `IconButton`, `Tooltip`, `Menu`, `MenuItem`, `CircularProgress`, `LockIcon`).
*   React Router (`HashRouter`, `Routes`, `Route`, `Navigate`, `useNavigate`, `useLocation`, `Link`).

---

## Expense Manager Module

### Files

*   `src/modules/ExpenseManager/ExpenseManager.jsx`
*   `src/modules/ExpenseManager/components/ExpenseForm.jsx`
*   `src/modules/ExpenseManager/components/ExpenseList.jsx`
*   `src/modules/ExpenseManager/components/ExpenseSummaryCards.jsx`
*   `src/modules/ExpenseManager/components/ExpenseNotifications.jsx`
*   `src/modules/ExpenseManager/components/ExpenseDialogs.jsx`

### Overview

Allows users to add, view, and delete their expense records. Provides summary information and supports bulk deletion.

### Key Components

*   **`ExpenseManager.jsx`:** Main orchestrator component. Fetches expense data, manages state for the list, form, dialogs, and notifications. Passes data and handlers down to child components.
*   **`ExpenseForm.jsx`:** Renders the form for adding new expenses, including fields for amount, category (with dropdown and custom input option), date, and description. Handles input changes and form submission triggers. Uses `expenseCategories` from `constants.js`.
*   **`ExpenseList.jsx`:** Displays the list of expenses in a `DataGrid`. Handles sorting, pagination, row selection for bulk delete, and triggers the single delete confirmation dialog. Uses `constants.js` to map category names to icons/translated names.
*   **`ExpenseSummaryCards.jsx`:** Displays cards summarizing total expenses and the number of entries.
*   **`ExpenseNotifications.jsx`:** Reusable component (likely shared) to display success/error messages via MUI `Snackbar` and `Alert`.
*   **`ExpenseDialogs.jsx`:** Renders confirmation dialogs for adding and deleting (single/bulk) expenses.

### Functionality

*   Fetch and display user's expenses in a sortable, paginated table.
*   Add new expenses using a detailed form with category selection and date picker.
*   Support for specifying a custom category if "Others" is selected.
*   Delete individual expenses with confirmation.
*   Select multiple expenses and delete them in bulk with confirmation.
*   Display summary cards for total expenses and entry count.
*   Show success/error notifications for actions.

### State Management

*   `ExpenseManager.jsx` uses `useState` to manage:
    *   `expenses`: Array of fetched expense objects.
    *   `isLoading`, `isSubmitting`, `isBulkDeleting`: Loading states for different operations.
    *   `notification`: State object for the Snackbar.
    *   `formData`: Current state of the add expense form.
    *   Dialog visibility states (`confirmDialogOpen`, `deleteDialogOpen`, `bulkDeleteDialogOpen`).
    *   `expenseToDelete`: ID of the expense selected for single deletion.
    *   `selectedExpenseIds`: Array of IDs selected for bulk deletion.

### API Interaction

*   `GET /expenses/{userId}`: Fetch all expenses for the user.
*   `POST /expenses`: Create a new expense.
*   `DELETE /expenses/{expense_id}`: Delete a single expense.
*   `POST /expenses/bulk/delete`: Delete multiple expenses.

### UI Library

*   Material UI (`Container`, `Card`, `DataGrid`, `TextField`, `Button`, `Select`, `MenuItem`, `DatePicker`, `Dialog`, `Snackbar`, `Alert`, `IconButton`, `Tooltip`, `CircularProgress`).
*   Day.js & `@mui/x-date-pickers`: For date handling.

---

## Income Manager Module

### Files

*   `src/modules/IncomeManager/IncomeManager.jsx`
*   `src/modules/IncomeManager/components/IncomeForm.jsx`
*   `src/modules/IncomeManager/components/IncomeList.jsx`

### Overview

Similar in structure to the Expense Manager, this module allows users to manage their income records (add, view, delete, bulk delete).

### Key Components

*   **`IncomeManager.jsx`:** Main component. Fetches income records and user accounts (for dropdown). Manages state for list, form, dialogs, notifications.
*   **`IncomeForm.jsx`:** Renders the form for adding income, including amount, date, source, description, and an optional account selection dropdown.
*   **`IncomeList.jsx`:** Displays income records in a `DataGrid`, handling selection, sorting, pagination, and triggering delete actions. Displays account name based on `account_id`.

### Functionality

*   Fetch and display user's income records.
*   Fetch user's accounts to populate the optional dropdown in the form.
*   Add new income records.
*   Delete single or multiple income records with confirmation (reuses `ConfirmationDialog`).
*   Show notifications (reuses `ExpenseNotifications`).

### State Management

*   `IncomeManager.jsx` uses `useState` for: `incomeList`, `accounts`, `isLoading`, `isSubmitting`, `isBulkDeleting`, `formData`, dialog states, `itemToDelete`, `selectedIncomeIds`.

### API Interaction

*   `GET /income/{userId}`
*   `GET /accounts/{userId}`
*   `POST /income`
*   `DELETE /income/{income_id}`
*   `POST /income/bulk/delete`

### UI Library

*   Material UI (`Container`, `Card`, `DataGrid`, `TextField`, `Button`, `Select`, `MenuItem`, `DatePicker`, `Dialog`, `Snackbar`, `Alert`, `IconButton`, `Tooltip`, `CircularProgress`).
*   Day.js & `@mui/x-date-pickers`.

---

## Account Manager Module

### Files

*   `src/modules/AccountManager/AccountManager.jsx`
*   `src/modules/AccountManager/components/AccountForm.jsx`
*   `src/modules/AccountManager/components/AccountList.jsx`
*   `src/modules/AccountManager/components/ConfirmationDialog.jsx`

### Overview

Enables users to define and manage their financial accounts (e.g., Checking, Savings, Cash).

### Key Components

*   **`AccountManager.jsx`:** Fetches and manages the list of accounts. Handles add and delete operations (single/bulk) and associated confirmations/notifications.
*   **`AccountForm.jsx`:** Form for adding a new account, including name, type, starting balance, and balance date.
*   **`AccountList.jsx`:** Displays accounts in a `DataGrid` with selection for bulk delete and actions for single delete.
*   **`ConfirmationDialog.jsx`:** Reusable dialog for confirming delete actions.

### Functionality

*   Fetch and display user's accounts.
*   Add new accounts.
*   Delete single or multiple accounts (backend prevents deletion if linked to transactions, returns 409 Conflict).
*   Show notifications (reuses `ExpenseNotifications`).

### State Management

*   `AccountManager.jsx` uses `useState` for: `accounts`, `isLoading`, `isSubmitting`, `isBulkDeleting`, `formData`, dialog states, `itemToDelete`, `selectedAccountIds`.

### API Interaction

*   `GET /accounts/{userId}`
*   `POST /accounts`
*   `DELETE /accounts/{account_id}`
*   `POST /accounts/bulk/delete` (Backend performs check for linked transactions, returns 409 on conflict).

### UI Library

*   Material UI (`Container`, `Card`, `DataGrid`, `TextField`, `Button`, `Select`, `MenuItem`, `DatePicker`, `Dialog`, `Snackbar`, `Alert`, `IconButton`, `Tooltip`, `CircularProgress`).
*   Day.js & `@mui/x-date-pickers`.

---

## Recurring Manager Module

### Files

*   `src/modules/RecurringManager/RecurringManager.jsx`
*   `src/modules/RecurringManager/components/RecurringForm.jsx`
*   `src/modules/RecurringManager/components/RecurringList.jsx`

### Overview

Allows users to define and manage recurring transactions (e.g., monthly bills, subscriptions).

### Key Components

*   **`RecurringManager.jsx`:** Fetches recurring rules and accounts. Manages state and handles add/delete operations.
*   **`RecurringForm.jsx`:** Form for adding recurring items, including name, amount, category, frequency, start/end dates, description, and optional account.
*   **`RecurringList.jsx`:** Displays recurring rules in a `DataGrid` with selection and delete actions.

### Functionality

*   Fetch and display recurring transaction rules.
*   Fetch accounts for the optional dropdown.
*   Add new recurring rules.
*   Delete single or multiple recurring rules with confirmation (reuses `ConfirmationDialog`).
*   Show notifications (reuses `ExpenseNotifications`).

### State Management

*   `RecurringManager.jsx` uses `useState` for: `recurringList`, `accounts`, `isLoading`, `isSubmitting`, `isBulkDeleting`, `formData`, dialog states, `itemToDelete`, `selectedRecurringIds`.

### API Interaction

*   `GET /recurring/{userId}`
*   `GET /accounts/{userId}`
*   `POST /recurring`
*   `DELETE /recurring/{recurring_id}`
*   `POST /recurring/bulk/delete`

### UI Library

*   Material UI (`Container`, `Card`, `DataGrid`, `TextField`, `Button`, `Select`, `MenuItem`, `DatePicker`, `Dialog`, `Snackbar`, `Alert`, `IconButton`, `Tooltip`, `CircularProgress`).
*   Day.js & `@mui/x-date-pickers`.
*   Uses `constants.js` for category selection.

---

## Planning Manager Module

### Files

*   `src/modules/PlanningManager/PlanningManager.jsx`
*   `src/modules/PlanningManager/components/BudgetView.jsx`
*   `src/modules/PlanningManager/components/BudgetForm.jsx`
*   `src/modules/PlanningManager/components/BudgetList.jsx`
*   `src/modules/PlanningManager/components/GoalView.jsx`
*   `src/modules/PlanningManager/components/GoalForm.jsx`
*   `src/modules/PlanningManager/components/GoalList.jsx`

### Overview

Provides a tabbed interface for managing financial Budgets and Goals.

### Key Components

*   **`PlanningManager.jsx`:** Main component acting as a container. Manages tabs, fetches budgets, goals, and accounts. Centralizes delete confirmation logic for both budgets and goals.
*   **`BudgetView.jsx`:** Container for budget-related components (`BudgetForm`, `BudgetList`). Passes props and handlers down from `PlanningManager`.
*   **`BudgetForm.jsx`:** Form for adding new budget rules (category, amount limit, period, start/end dates).
*   **`BudgetList.jsx`:** Displays budget rules in a `DataGrid` with selection and delete actions.
*   **`GoalView.jsx`:** Container for goal-related components (`GoalForm`, `GoalList`). Passes props and handlers down.
*   **`GoalForm.jsx`:** Form for adding new financial goals (name, target amount, current amount, target date).
*   **`GoalList.jsx`:** Displays goals in a `DataGrid` with progress visualization, selection, and delete actions.

### Functionality

*   Switch between Budget and Goal management views using Tabs.
*   Fetch and display budgets and goals.
*   Add new budgets and goals via respective forms.
*   Delete single or multiple budgets/goals with confirmation (reuses `ConfirmationDialog`).
*   Show notifications (reuses `ExpenseNotifications`).

### State Management

*   `PlanningManager.jsx` uses `useState` for: `activeTab`, `budgets`, `goals`, `accounts`, loading states (`isLoadingBudgets`, etc.), combined `isDeleting` state, dialog states (`deleteDialogOpen`, `bulkDeleteDialogOpen`, `itemToDelete`, `deleteType`), `selectedBudgetIds`, `selectedGoalIds`.
*   Child views (`BudgetView`, `GoalView`) may have minimal local state (e.g., `isAdding` in forms).

### API Interaction

*   `GET /budgets/{userId}`
*   `GET /goals/{userId}`
*   `GET /accounts/{userId}`
*   `POST /budgets`
*   `POST /goals`
*   `DELETE /budgets/{budget_id}`
*   `DELETE /goals/{goal_id}`
*   `POST /budgets/bulk/delete`
*   `POST /goals/bulk/delete`

### UI Library

*   Material UI (`Container`, `Tabs`, `Tab`, `Box`, `Card`, `DataGrid`, `TextField`, `Button`, `Select`, `MenuItem`, `DatePicker`, `Dialog`, `Snackbar`, `Alert`, `IconButton`, `Tooltip`, `CircularProgress`, `LinearProgress`).
*   Day.js & `@mui/x-date-pickers`.
*   Uses `constants.js` for category selection.

---

## Dynamic Dashboard Module

### Files

*   `src/modules/DynamicDashboard/DynamicDashboard.jsx`
*   `src/modules/DynamicDashboard/AddWidgetDialog.jsx`
*   `src/modules/DynamicDashboard/widgets/*` (numerous widget components)
*   `src/modules/DynamicDashboard/widgets/WidgetWrapper.jsx`

### Overview

Provides a highly customizable dashboard experience where users can add, remove, resize, and rearrange various data visualization widgets.

### Key Components

*   **`DynamicDashboard.jsx`:** The core dashboard component.
    *   Fetches *all* necessary data types (expenses, income, budgets, goals, accounts, recurring items) required by the various widgets.
    *   Manages the state of active widgets and their layout using `react-grid-layout`.
    *   Persists widget layout and filter settings to `localStorage`.
    *   Handles filtering logic (time period, category/source, amount) and passes filtered data down to relevant widgets.
    *   Renders the `ResponsiveGridLayout` and the individual widget components wrapped in `WidgetWrapper`.
    *   Manages the `AddWidgetDialog`.
*   **`AddWidgetDialog.jsx`:** A dialog allowing users to select which widgets to display on the dashboard. Shows checkboxes for all available widgets defined in `WIDGET_COMPONENTS`.
*   **`TimePeriodSelectorWidget.jsx`:** A dedicated widget (though placed outside the grid in the example) for selecting the time range (presets or custom dates) for the dashboard data. Persists selection to `localStorage`.
*   **`FilterWidget.jsx`:** A dedicated widget for filtering data shown in *other* widgets by category/source and amount range.
*   **Widget Components (`widgets/*.jsx`):** Individual components responsible for displaying specific information (e.g., `OverviewSummaryWidget`, `CategoryBreakdownWidget`, `ExpenseTrendWidget`, `AccountBalanceWidget`, `NetCashFlowWidget`, `IncomeTimelineWidget`, etc.). Each widget typically receives filtered data props from `DynamicDashboard.jsx` and uses libraries like `Recharts` for visualization. See `dashboard_widgets.md` for details on each.
*   **`WidgetWrapper.jsx`:** A HOC that wraps each specific widget component. Provides a consistent card structure with a title, a drag handle (`.widget-drag-handle`), and a remove button (`.widget-remove-button`).

### Functionality

*   Display financial data through various interactive widgets.
*   Allow users to select a time period for the displayed data.
*   Allow users to filter data by category/source and amount range.
*   Add/Remove widgets via a dialog.
*   Rearrange and resize widgets using drag-and-drop (`react-grid-layout`).
*   Persist the dashboard layout and filters across sessions using `localStorage`.

### State Management

*   `DynamicDashboard.jsx` uses `useState` extensively for:
    *   `layouts`: Stores layout information for different breakpoints (`react-grid-layout`).
    *   `widgets`: Array representing the currently active widgets (type and unique ID).
    *   `allExpenses`, `allIncome`, etc.: Stores the complete fetched datasets.
    *   `isLoadingData`: Tracks loading state for initial data fetch.
    *   `timePeriod`: Object holding the currently selected start/end dates.
    *   `activeFilters`: Object holding category/amount range filters.
    *   `isAddWidgetDialogOpen`: Controls the add widget dialog visibility.
*   `TimePeriodSelectorWidget` manages its internal state for custom dates and selected preset, persisting to `localStorage`.
*   `FilterWidget` manages temporary slider state (`tempAmountRange`) for debouncing.
*   Individual widgets typically receive data as props and may have minimal internal state if needed for interactions within the widget itself.

### API Interaction

*   `DynamicDashboard.jsx` fetches data from multiple endpoints on load:
    *   `GET /expenses/{userId}`
    *   `GET /income/{userId}`
    *   `GET /budgets/{userId}`
    *   `GET /goals/{userId}`
    *   `GET /accounts/{userId}`
    *   `GET /recurring/{userId}` (Needed for Upcoming Bills widget)
*   Specific widgets might make additional API calls if necessary (though most rely on data passed from the parent). `QuickAddWidget` calls `POST /expenses` or `POST /income`.

### UI Library

*   Material UI (`Container`, `Button`, `Box`, `Dialog`, `Card`, `List`, `Checkbox`, `Slider`, `Chip`, `Select`, `MenuItem`, etc.).
*   **react-grid-layout:** For the draggable/resizable grid.
*   **Recharts:** For rendering charts within widgets.
*   date-fns: For date calculations and formatting.

---

## Settings Module

### Files

*   `src/modules/Settings.jsx`
*   Uses shared component: `ExpenseNotifications`.

### Overview

Provides a central place for users to manage their profile information, change their password (in-app), manage their application licence key, perform data backups/restores (JSON), and configure the backend database connection.

### Key Components

*   **`Settings.jsx`:** A single component managing different settings sections (Profile, Licence, Data, Database) within Cards. Includes dialogs for in-app password change and import confirmation.

### Functionality

*   **Profile:** Load, display, validate, edit, and save user profile data (name, username, email, contact).
*   **Change Password (In-App):**
    *   Button opens a dialog prompting for Current Password, New Password, and Confirmation.
    *   Performs client-side validation (required, match, complexity).
    *   Calls the `/users/{userId}/password` backend endpoint to update the password.
    *   Displays success/error feedback within the dialog or via Snackbar.
*   **Licence Management:**
    *   Fetches and displays current licence status (Active/Inactive/Not Set) and masked key prefix using `GET /users/{userId}/licence`.
    *   Provides input field for new licence key.
    *   Calls `PUT /users/{userId}/licence` endpoint to update the key after format check. Backend validates against accepted list.
    *   Displays success/error messages and refreshes status.
*   **Data Management:**
    *   **Export:** Trigger full JSON data export via `GET /export/all/{userId}`. Initiates browser download.
    *   **Import:** Upload JSON backup via `POST /import/all/{userId}`. Warns about data replacement, shows confirmation dialog, displays backend processing results (success/errors).
*   **Database Configuration:**
    *   Select DB type (Local, Cloud, Custom), input custom URL.
    *   Calls `PUT /settings/database` endpoint.
    *   Warns about required application restart.

### State Management

*   `Settings.jsx` uses `useState` for:
    *   `settings` (profile data).
    *   Loading states (`isLoading`, `isExporting`, `isImporting`, `dbSettingsLoading`, `isActivating` [licence], `passwordChangeLoading`).
    *   Error states (`error`, `importError`, `dbConfigError`, `activationError`, `passwordChangeError`).
    *   `snackbar*` (notifications).
    *   Dialog visibility (`passwordDialogOpen`, `confirmImportDialogOpen`).
    *   Import state (`selectedImportFile`, `importResult`).
    *   Licence state (`licenceKeyInput`, `currentLicenceStatus`, `currentLicenceKeyPrefix`).
    *   Password dialog state (`currentPassword`, `newPassword`, `confirmNewPassword`, show password toggles).
    *   DB config state (`dbType`, `customDbUrl`, `restartRequired`).
    *   `formErrors` (profile validation).

### API Interaction

*   `GET /users/{userId}`: Load user profile.
*   `PUT /users/{userId}`: Save updated profile data.
*   `PUT /users/{userId}/password`: Change password in-app.
*   `GET /users/{userId}/licence`: Get licence status.
*   `PUT /users/{userId}/licence`: Update licence key.
*   `GET /export/all/{userId}`: Trigger data export (returns JSON file).
*   `POST /import/all/{userId}`: Upload JSON for import/restore.
*   `PUT /settings/database`: Update DB config.

### UI Library

*   Material UI (`Container`, `Card`, `CardHeader`, `CardContent`, `Grid`, `TextField`, `Button`, `Snackbar`, `Alert`, `Dialog`, `CircularProgress`, `LinearProgress`, `Divider`, `RadioGroup`, `FormControlLabel`, `Radio`, `IconButton`, `InputAdornment`).

---

## Expense Import Module

### Files

*   `src/modules/ExpenseImport/ExpenseImport.jsx`

### Overview

Provides dedicated interfaces for users to bulk import **expense** and **income** data from CSV files.

### Key Components

*   **`ExpenseImport.jsx`:** Contains two distinct sections (within Cards) for handling Expense CSV import and Income CSV import.

### Functionality

*   **File Selection:** Provides separate "Select File" buttons and hidden file inputs for expense and income CSVs. Includes basic client-side type validation (`text/csv`).
*   **Upload:** Sends the selected CSV file to the corresponding backend import endpoint (`/expenses/import/{userId}` or `/income/import/{userId}`).
*   **Feedback:** Displays loading indicators during upload/processing. Shows success or error messages returned from the backend, including details about imported counts, skipped rows, and specific validation errors.

### State Management

*   `ExpenseImport.jsx` uses `useState` separately for expense and income imports:
    *   `selectedExpenseFile`, `selectedIncomeFile`: Stores the currently selected file object.
    *   `isExpenseLoading`, `isIncomeLoading`: Loading states for each import type.
    *   `expenseError`, `incomeError`: Stores API or validation error messages.
    *   `expenseImportResult`, `incomeImportResult`: Stores the structured response from the backend API upon completion.

### API Interaction

*   `POST /expenses/import/{userId}`
*   `POST /income/import/{userId}`

### UI Library

*   Material UI (`Container`, `Card`, `CardHeader`, `CardContent`, `Button`, `Box`, `Typography`, `LinearProgress`, `Alert`, `List`, `ListItem`, `Chip`, `Grid`).

---

## Expense Reports Module (Standard Reports)

### Files

*   `src/modules/ExpenseReports.jsx`

### Overview

Allows users to generate and download comprehensive **standard** reports containing all their financial data (expenses, income, accounts, budgets, goals, recurring items) in various formats.

### Key Components

*   **`ExpenseReports.jsx`:** Main component for the standard reporting feature.

### Functionality

*   **Fetch Data:** Retrieves all necessary data for the report using the consolidated backend endpoint (`GET /reports/{userId}/all`).
*   **Display Summary:** Shows the total number of records found across all data types.
*   **Download Options:** Provides buttons to trigger the generation and download of reports in different formats:
    *   **Excel:** Uses the `xlsx` library to generate a multi-sheet `.xlsx` file client-side from the fetched data.
    *   **PDF:** Uses `jspdf` and `jspdf-autotable` to generate a multi-page PDF document client-side, rendering each data type in a separate table.
    *   **Individual CSVs:** Uses `react-csv` to provide download links for each data type (expenses, income, etc.) as separate `.csv` files.

### State Management

*   `ExpenseReports.jsx` uses `useState` for:
    *   `reportData`: Stores the complete dataset fetched from the API.
    *   `isLoading`: Tracks the data fetching state.
    *   `error`: Stores any error message during data fetching.

### API Interaction

*   `GET /reports/{userId}/all`: Fetches the consolidated data required for generating standard reports.

### UI Library

*   Material UI (`Container`, `Card`, `CardHeader`, `CardContent`, `Button`, `Typography`, `Box`, `CircularProgress`, `Alert`, `Grid`, `Divider`).
*   `react-csv`: For CSV download links.
*   `xlsx`: For client-side Excel generation.
*   `jspdf` & `jspdf-autotable`: For client-side PDF generation.

---

## Custom Reports Module (Licence Required)

### Files

*   `src/modules/CustomReports.jsx` (Assuming this exists)

### Overview

Allows users with an **active licence** to generate customized reports by selecting specific data types, date ranges, and output formats.

### Key Components

*   **`CustomReports.jsx`:** Main component for the custom reporting feature.

### Functionality

*   **Licence Check:** Access to this module is typically gated by the Sidebar based on the user's licence status. The component itself might also perform a check or rely on the backend rejecting the API call.
*   **UI Controls:** Provides UI elements (checkboxes, date pickers, dropdowns) for selecting:
    *   Data Types (e.g., Expenses, Income, Accounts)
    *   Date Range (Start Date, End Date)
    *   Output Format (CSV, Excel, PDF)
*   **Report Generation:** Sends a `POST` request to the `/reports/{userId}/custom` backend endpoint with the selected parameters.
*   **Download:** The backend processes the request based on the parameters and returns the generated report file for download.

### State Management

*   `CustomReports.jsx` uses `useState` for:
    *   Selected data types, start/end dates, output format.
    *   `isLoading`: Tracks the report generation state.
    *   `error`: Stores any error message (e.g., from API call, licence issue).

### API Interaction

*   `POST /reports/{userId}/custom`: Sends report parameters and receives the generated file. Requires active licence (backend enforced).

### UI Library

*   Material UI (`Container`, `Card`, `Checkbox`, `DatePicker`, `Select`, `MenuItem`, `Button`, `CircularProgress`, `Alert`).
*   Day.js & `@mui/x-date-pickers`.



# Frontend Module: Planning Manager

## Files

*   `src/modules/PlanningManager/PlanningManager.jsx`
*   `src/modules/PlanningManager/components/BudgetView.jsx`
*   `src/modules/PlanningManager/components/BudgetForm.jsx`
*   `src/modules/PlanningManager/components/BudgetList.jsx`
*   `src/modules/PlanningManager/components/GoalView.jsx`
*   `src/modules/PlanningManager/components/GoalForm.jsx`
*   `src/modules/PlanningManager/components/GoalList.jsx`
*   Uses shared components: `ExpenseNotifications`, `ConfirmationDialog`.
*   Relevant entries in `src/modulesConfig.js` and `src/locales/*.json`.
*   Uses categories from `src/constants.js`.

## Overview

This module serves as a central hub for financial planning activities, specifically managing spending Budgets and savings Goals. It uses a tabbed interface to separate these two related but distinct functions.

## Key Components

*   **`PlanningManager.jsx`:** The main container component for this module.
    *   Manages the state for switching between the "Budgets" and "Goals" tabs.
    *   Fetches the necessary data for both views: budgets, goals, and accounts (though accounts aren't directly used in forms here, they might be needed for future enhancements or context).
    *   Centralizes the logic for handling delete confirmations (both single and bulk) for budgets and goals, using a shared `ConfirmationDialog` and tracking the `deleteType` ('budget' or 'goal').
    *   Passes fetched data and relevant action handlers (add, delete, selection change) down to the `BudgetView` and `GoalView` components.
*   **`BudgetView.jsx`:** A container component specifically for the "Budgets" tab. It renders `BudgetForm` and `BudgetList`, passing down the budget data and relevant handlers received from `PlanningManager`.
*   **`BudgetForm.jsx`:** The form used to create new budget rules. Users can specify a category (from the standard expense categories), an amount limit, a period (Monthly, Quarterly, Yearly), a start date, and an optional end date.
*   **`BudgetList.jsx`:** Displays the existing budget rules in an MUI `DataGrid`. Shows category, limit, period, and dates. Provides selection checkboxes for bulk deletion and an action button for single deletion.
*   **`GoalView.jsx`:** A container component for the "Goals" tab, rendering `GoalForm` and `GoalList`. Passes down goal data and handlers.
*   **`GoalForm.jsx`:** The form for creating new financial goals. Users input a name (e.g., "Vacation Fund"), a target amount, the current amount saved (optional, defaults to 0), and an optional target date. Includes basic validation (target > 0, current <= target).
*   **`GoalList.jsx`:** Displays the defined financial goals in an MUI `DataGrid`. Shows goal name, target/current amounts, target date, and visualizes progress using an MUI `LinearProgress` bar within a custom cell renderer. Provides selection and deletion actions.

## Functionality

*   Switch between managing Budgets and Goals using MUI Tabs.
*   Fetch and display lists of existing budgets and goals.
*   Add new budget rules for specific expense categories and time periods.
*   Add new savings goals with target amounts and optional dates.
*   Delete individual budgets or goals with confirmation.
*   Select multiple budgets or goals and delete them in bulk with confirmation.
*   Display success/error notifications (reuses `ExpenseNotifications`).
*   Translate category and period names.

## State Management

*   `PlanningManager.jsx` uses `useState` to manage:
    *   `activeTab`: Tracks the currently selected tab (0 for Budgets, 1 for Goals).
    *   `budgets`, `goals`, `accounts`: Arrays holding fetched data.
    *   Loading states: `isLoadingBudgets`, `isLoadingGoals`, `isLoadingAccounts`.
    *   `isDeleting`: A combined state indicating if *any* delete operation (single or bulk, budget or goal) is in progress.
    *   Dialog states: `deleteDialogOpen`, `bulkDeleteDialogOpen`.
    *   `itemToDelete`: Object storing details (`type`, `id`, `name`) of the item selected for single deletion.
    *   `deleteType`: String ('budget' or 'goal') indicating the context for the bulk delete dialog.
    *   `selectedBudgetIds`, `selectedGoalIds`: Arrays tracking IDs selected for bulk deletion in respective lists.
    *   `notification`: State for Snackbar messages.
*   Child form components (`BudgetForm`, `GoalForm`) manage their own `formData` state locally.

## API Interaction

*   `GET /budgets/{userId}`: Fetch all budget rules.
*   `GET /goals/{userId}`: Fetch all goals.
*   `GET /accounts/{userId}`: Fetch accounts (currently fetched but not directly used in forms).
*   `POST /budgets`: Create a new budget rule.
*   `POST /goals`: Create a new goal.
*   `DELETE /budgets/{budget_id}`: Delete a single budget rule.
*   `DELETE /goals/{goal_id}`: Delete a single goal.
*   `POST /budgets/bulk/delete`: Delete multiple budget rules.
*   `POST /goals/bulk/delete`: Delete multiple goals.

## UI Library

*   Material UI (`Container`, `Tabs`, `Tab`, `Box`, `Card`, `DataGrid`, `TextField`, `Button`, `Select`, `MenuItem`, `DatePicker`, `Dialog`, `Snackbar`, `Alert`, `IconButton`, `Tooltip`, `CircularProgress`, `LinearProgress`, `Typography`).
*   Day.js & `@mui/x-date-pickers`: For date pickers.
*   Uses `constants.js` for category list in `BudgetForm`.

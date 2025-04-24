# Frontend Module: Expense Manager

## Files

*   `src/modules/ExpenseManager/ExpenseManager.jsx`
*   `src/modules/ExpenseManager/components/ExpenseForm.jsx`
*   `src/modules/ExpenseManager/components/ExpenseList.jsx`
*   `src/modules/ExpenseManager/components/ExpenseSummaryCards.jsx`
*   `src/modules/ExpenseManager/components/ExpenseNotifications.jsx`
*   `src/modules/ExpenseManager/components/ExpenseDialogs.jsx`
*   Relevant entries in `src/modulesConfig.js` and `src/locales/*.json`
*   Uses icons/categories defined in `src/constants.js`

## Overview

This module allows users to add, view, manage, and delete their expense records. It provides summary information and supports bulk actions.

## Key Components

*   **`ExpenseManager.jsx`:** Main orchestrator component for this module. Fetches expense data, manages state for the list, form, dialogs, and notifications. Passes data and callback handlers down to child components.
*   **`ExpenseForm.jsx`:** Renders the form for adding new expenses. Includes fields for amount, category (with dropdown populated from `constants.js` and custom input option), date picker, and description. Handles input changes and triggers the submission confirmation.
*   **`ExpenseList.jsx`:** Displays the list of expenses using MUI `DataGrid`. Handles sorting, pagination, row selection for bulk delete, and triggers the single delete confirmation dialog via a button in the 'Actions' column. Uses helper functions from `constants.js` to display category icons and translated names.
*   **`ExpenseSummaryCards.jsx`:** Displays cards summarizing total expenses and the number of expense entries based on the current list data.
*   **`ExpenseNotifications.jsx`:** Shared component to display success/error messages via MUI `Snackbar` and `Alert`.
*   **`ExpenseDialogs.jsx`:** Renders MUI `Dialog` components for confirming the addition of a new expense and for confirming single or bulk deletion actions.

## Functionality

*   Fetch and display user's expenses in a sortable, paginated table.
*   Add new expenses using a detailed form with category selection (from predefined list or custom) and date picker.
*   Delete individual expenses with confirmation.
*   Select multiple expenses using checkboxes in the table and delete them in bulk with confirmation.
*   Display summary cards for total expenses and the total number of entries.
*   Show success/error notifications for add/delete actions.
*   Translate category names in the form dropdown and the list view.

## State Management

*   `ExpenseManager.jsx` uses `useState` to manage:
    *   `expenses`: Array of fetched expense objects.
    *   `isLoading`, `isSubmitting`, `isBulkDeleting`: Loading states for fetching, form submission, and bulk delete operations.
    *   `notification`: State object for the Snackbar notification.
    *   `formData`: Current state of the add expense form.
    *   Dialog visibility states (`confirmDialogOpen`, `deleteDialogOpen`, `bulkDeleteDialogOpen`).
    *   `showOtherCategoryField`: Controls visibility of the custom category input in the form.
    *   `expenseToDelete`: ID of the expense selected for single deletion.
    *   `selectedExpenseIds`: Array of expense IDs selected for bulk deletion.

## API Interaction

*   `GET /expenses/{userId}`: Fetch all expenses for the logged-in user.
*   `POST /expenses`: Create a new expense record.
*   `DELETE /expenses/{expense_id}`: Delete a single expense record by its ID.
*   `POST /expenses/bulk/delete`: Delete multiple expense records based on a list of IDs provided in the request body.

## UI Library

*   Material UI (`Container`, `Card`, `DataGrid`, `TextField`, `Button`, `Select`, `MenuItem`, `DatePicker`, `Dialog`, `Snackbar`, `Alert`, `IconButton`, `Tooltip`, `CircularProgress`, `Box`, `Typography`).
*   Day.js & `@mui/x-date-pickers`: For date handling and the DatePicker component.

# Frontend Module: Income Manager

## Files

*   `src/modules/IncomeManager/IncomeManager.jsx`
*   `src/modules/IncomeManager/components/IncomeForm.jsx`
*   `src/modules/IncomeManager/components/IncomeList.jsx`
*   Uses shared components: `ExpenseNotifications`, `ConfirmationDialog`.
*   Relevant entries in `src/modulesConfig.js` and `src/locales/*.json`.

## Overview

Similar in structure to the Expense Manager, this module allows users to manage their income records. Users can add new income entries, view their income history, and delete records individually or in bulk.

## Key Components

*   **`IncomeManager.jsx`:** Main component for the income section. Fetches income records and user accounts (used for an optional dropdown in the form). Manages the state for the income list, the add form, deletion dialogs, and notifications.
*   **`IncomeForm.jsx`:** Renders the form for adding new income records. Includes fields for amount, date, source (free text), description (optional), and an optional dropdown to link the income to a user-defined Account.
*   **`IncomeList.jsx`:** Displays the user's income records in an MUI `DataGrid`. Supports sorting, pagination, row selection for bulk deletion, and includes an action button for single record deletion. Fetches account data to display the linked account name if an `account_id` is present.

## Functionality

*   Fetch and display the user's income records in a table.
*   Fetch the user's list of accounts to populate the optional "Account" dropdown in the form.
*   Allow users to add new income records, specifying amount, date, source, and optionally linking to an account.
*   Allow deletion of single income records via a confirmation dialog.
*   Allow selection of multiple income records and bulk deletion via a confirmation dialog.
*   Display success/error notifications for actions (reuses shared `ExpenseNotifications`).
*   Use a shared `ConfirmationDialog` component for delete confirmations.

## State Management

*   `IncomeManager.jsx` uses `useState` to manage:
    *   `incomeList`: Array of fetched income objects.
    *   `accounts`: Array of fetched account objects for the dropdown.
    *   Loading states: `isLoading` (for income list), `isFetchingAccounts`, `isSubmitting` (for form), `isBulkDeleting`.
    *   `notification`: State for Snackbar messages.
    *   `formData`: State for the add income form.
    *   Dialog states: `deleteDialogOpen`, `bulkDeleteDialogOpen`.
    *   `itemToDelete`: Stores the income object selected for single deletion.
    *   `selectedIncomeIds`: Array of income record IDs selected for bulk deletion.

## API Interaction

*   `GET /income/{userId}`: Fetch all income records for the user.
*   `GET /accounts/{userId}`: Fetch the list of user accounts for the dropdown.
*   `POST /income`: Create a new income record.
*   `DELETE /income/{income_id}`: Delete a single income record.
*   `POST /income/bulk/delete`: Delete multiple income records based on a list of IDs.

## UI Library

*   Material UI (`Container`, `Card`, `DataGrid`, `TextField`, `Button`, `Select`, `MenuItem`, `DatePicker`, `Dialog`, `Snackbar`, `Alert`, `IconButton`, `Tooltip`, `CircularProgress`, `Box`, `Typography`).
*   Day.js & `@mui/x-date-pickers`: For date handling.

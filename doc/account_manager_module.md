# Frontend Module: Account Manager

## Files

*   `src/modules/AccountManager/AccountManager.jsx`
*   `src/modules/AccountManager/components/AccountForm.jsx`
*   `src/modules/AccountManager/components/AccountList.jsx`
*   `src/modules/AccountManager/components/ConfirmationDialog.jsx`
*   Uses shared component: `ExpenseNotifications`.
*   Relevant entries in `src/modulesConfig.js` and `src/locales/*.json`.

## Overview

This module enables users to define and manage their financial accounts, such as checking accounts, savings accounts, credit cards, or cash wallets. These accounts can optionally be linked to income and recurring transactions.

## Key Components

*   **`AccountManager.jsx`:** The main component for managing accounts. It fetches the list of existing accounts, handles the submission of new accounts via the form, and manages the process for deleting single or multiple accounts, including confirmation dialogs and notifications.
*   **`AccountForm.jsx`:** Provides the form fields for creating a new account. This includes Account Name, Account Type (dropdown with predefined types like Checking, Savings, etc.), Starting Balance, and the "Balance As Of Date" (the date the starting balance was correct).
*   **`AccountList.jsx`:** Displays the user's defined accounts in an MUI `DataGrid`. Includes columns for account details and provides checkboxes for selecting accounts for bulk deletion and an action button for initiating single account deletion.
*   **`ConfirmationDialog.jsx`:** A reusable dialog component used here to confirm both single and bulk account deletions.

## Functionality

*   Fetch and display the list of user-defined financial accounts.
*   Allow users to add new accounts by specifying essential details.
*   Allow users to delete individual accounts after confirmation.
*   Allow users to select multiple accounts and delete them in bulk after confirmation.
*   **Important Deletion Constraint:** The backend API prevents the deletion of an account if it is currently linked to any existing expense, income, or recurring transaction records (`account_id` foreign key). The frontend displays an error message (HTTP 409 Conflict) from the backend if such a conflict occurs during deletion.
*   Display success/error notifications for add/delete actions (reuses shared `ExpenseNotifications`).

## State Management

*   `AccountManager.jsx` uses `useState` to manage:
    *   `accounts`: Array of fetched account objects.
    *   `isLoading`, `isSubmitting`, `isBulkDeleting`: Loading states.
    *   `notification`: State for Snackbar messages.
    *   `formData`: State for the add account form.
    *   Dialog states: `deleteDialogOpen`, `bulkDeleteDialogOpen`.
    *   `itemToDelete`: Stores the account object selected for single deletion.
    *   `selectedAccountIds`: Array of account IDs selected for bulk deletion.

## API Interaction

*   `GET /accounts/{userId}`: Fetch all accounts for the user.
*   `POST /accounts`: Create a new account record.
*   `DELETE /accounts/{account_id}`: Delete a single account (backend checks for dependencies).
*   `POST /accounts/bulk/delete`: Delete multiple accounts (backend checks for dependencies, returns 409 on conflict).

## UI Library

*   Material UI (`Container`, `Card`, `DataGrid`, `TextField`, `Button`, `Select`, `MenuItem`, `DatePicker`, `Dialog`, `Snackbar`, `Alert`, `IconButton`, `Tooltip`, `CircularProgress`, `Box`, `Typography`).
*   Day.js & `@mui/x-date-pickers`: For the "Balance As Of Date" picker.


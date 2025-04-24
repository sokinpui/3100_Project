# Frontend Module: Recurring Manager

## Files

*   `src/modules/RecurringManager/RecurringManager.jsx`
*   `src/modules/RecurringManager/components/RecurringForm.jsx`
*   `src/modules/RecurringManager/components/RecurringList.jsx`
*   Uses shared components: `ExpenseNotifications`, `ConfirmationDialog`.
*   Relevant entries in `src/modulesConfig.js` and `src/locales/*.json`.
*   Uses categories from `src/constants.js`.

## Overview

This module allows users to define and manage recurring transactions, which are typically fixed expenses or income that occur at regular intervals (e.g., monthly rent, weekly allowance, yearly subscriptions).

## Key Components

*   **`RecurringManager.jsx`:** The main component for this section. It fetches the list of recurring transaction rules defined by the user and also fetches the list of user accounts (for an optional dropdown in the form). It handles the addition of new recurring rules and the deletion (single and bulk) of existing ones, managing associated state like loading indicators, dialogs, and notifications.
*   **`RecurringForm.jsx`:** Provides the form for adding a new recurring item. Fields include Name (e.g., "Rent", "Netflix"), Amount, Category (from the standard expense categories), Frequency (dropdown: Daily, Weekly, Monthly, Quarterly, Yearly), Start Date, End Date (optional), Description (optional), and Account (optional dropdown linking to a user-defined account).
*   **`RecurringList.jsx`:** Displays the defined recurring rules in an MUI `DataGrid`. Shows details like name, amount, frequency, dates, and linked account name. Provides selection checkboxes for bulk deletion and an action button for single deletion.

## Functionality

*   Fetch and display the user's defined recurring transaction rules.
*   Fetch the user's accounts to populate the optional "Account" dropdown in the form.
*   Allow users to add new recurring rules with details about frequency and dates.
*   Allow deletion of single recurring rules via a confirmation dialog.
*   Allow selection of multiple rules and bulk deletion via a confirmation dialog.
*   Display success/error notifications (reuses shared `ExpenseNotifications`).
*   Use a shared `ConfirmationDialog` for delete actions.
*   Translate frequency names (e.g., "monthly" to "Monthly").

## State Management

*   `RecurringManager.jsx` uses `useState` to manage:
    *   `recurringList`: Array of fetched recurring rule objects.
    *   `accounts`: Array of fetched account objects for the dropdown.
    *   Loading states: `isLoading` (for list), `isFetchingAccounts`, `isSubmitting` (for form), `isBulkDeleting`.
    *   `notification`: State for Snackbar messages.
    *   `formData`: State for the add recurring item form.
    *   Dialog states: `deleteDialogOpen`, `bulkDeleteDialogOpen`.
    *   `itemToDelete`: Stores the recurring item object selected for single deletion.
    *   `selectedRecurringIds`: Array of recurring rule IDs selected for bulk deletion.

## API Interaction

*   `GET /recurring/{userId}`: Fetch all recurring rules for the user.
*   `GET /accounts/{userId}`: Fetch accounts for the form dropdown.
*   `POST /recurring`: Create a new recurring rule.
*   `DELETE /recurring/{recurring_id}`: Delete a single recurring rule.
*   `POST /recurring/bulk/delete`: Delete multiple recurring rules based on a list of IDs.

## UI Library

*   Material UI (`Container`, `Card`, `DataGrid`, `TextField`, `Button`, `Select`, `MenuItem`, `DatePicker`, `Dialog`, `Snackbar`, `Alert`, `IconButton`, `Tooltip`, `CircularProgress`, `Box`, `Typography`).
*   Day.js & `@mui/x-date-pickers`: For date pickers.
*   Uses `constants.js` for category list.

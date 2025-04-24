# Frontend Module: Expense Import

## Files

*   `src/modules/ExpenseImport/ExpenseImport.jsx`
*   Relevant entries in `src/modulesConfig.js` and `src/locales/*.json`.

## Overview

This module provides dedicated interfaces within a single page for users to bulk import expense data and income data from separate CSV (Comma Separated Values) files.

## Key Components

*   **`ExpenseImport.jsx`:** The main component for this feature. It renders two distinct sections, typically within MUI Cards, one for importing expenses and one for importing income. Each section has its own file input, upload button, and area for displaying feedback or results.

## Functionality

*   **File Selection (Expenses):**
    *   Provides a "Select CSV File" button specifically for expense data.
    *   Uses a hidden `<input type="file">` element (`expenseFileInputRef`) restricted to `.csv` files.
    *   Performs basic client-side validation to ensure the selected file is a CSV.
    *   Displays the name of the selected expense CSV file.
*   **File Selection (Income):**
    *   Provides a separate "Select CSV File" button for income data.
    *   Uses a distinct hidden file input (`incomeFileInputRef`).
    *   Displays the name of the selected income CSV file.
    *   Selecting a file in one section clears the selection in the other section to avoid confusion.
*   **Upload (Expenses):**
    *   An "Upload and Process" button, enabled only when an expense CSV is selected.
    *   When clicked, creates a `FormData` object with the file.
    *   Sends a `POST` request to the `/expenses/import/{userId}` backend endpoint.
    *   Displays a loading indicator during the upload and processing.
*   **Upload (Income):**
    *   A separate "Upload and Process" button for income, enabled only when an income CSV is selected.
    *   Sends a `POST` request to the `/income/import/{userId}` backend endpoint.
    *   Displays a loading indicator.
*   **Feedback Display:**
    *   Shows error messages if file selection fails client-side validation (e.g., wrong file type).
    *   Displays API error messages if the upload/processing fails on the backend.
    *   Upon successful processing (even with partial errors), displays the result message from the backend API, typically including:
        *   Overall status (e.g., "Import successful!", "Import completed with errors.").
        *   Number of records successfully imported.
        *   Number of rows skipped due to errors (if any).
        *   A list of specific errors encountered during backend validation/processing (if any).

## State Management

*   `ExpenseImport.jsx` uses `useState` hooks independently for the expense and income sections to manage:
    *   `selectedExpenseFile`, `selectedIncomeFile`: Stores the `File` object selected by the user for each type.
    *   `isExpenseLoading`, `isIncomeLoading`: Boolean flags to indicate if an upload/processing operation is in progress for each type.
    *   `expenseError`, `incomeError`: Stores error messages related to file selection or API interaction for each type.
    *   `expenseImportResult`, `incomeImportResult`: Stores the structured response object received from the backend API after an import attempt for each type.

## API Interaction

*   `POST /expenses/import/{userId}`: Uploads a CSV file containing expense data for processing by the backend.
*   `POST /income/import/{userId}`: Uploads a CSV file containing income data for processing by the backend.

## UI Library

*   Material UI (`Container`, `Card`, `CardHeader`, `CardContent`, `Button`, `Box`, `Typography`, `LinearProgress`, `Alert`, `List`, `ListItem`, `ListItemIcon`, `ListItemText`, `Chip`, `Grid`).

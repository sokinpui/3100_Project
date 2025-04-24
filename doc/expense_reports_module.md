# Frontend Module: Expense Reports

## Files

*   `src/modules/ExpenseReports.jsx`
*   Relevant entries in `src/modulesConfig.js` and `src/locales/*.json`.

## Overview

This module allows users to generate and download comprehensive reports containing all their stored financial data, including expenses, income, recurring items, budgets, goals, and accounts. Downloads are offered in multiple common formats (Excel, PDF, individual CSVs).

## Key Components

*   **`ExpenseReports.jsx`:** The primary component for the reporting feature. It fetches the consolidated report data from the backend and provides the UI elements for initiating downloads in various formats.

## Functionality

*   **Data Fetching:** On load, it makes a single API call to the `/reports/{userId}/all` endpoint to retrieve a complete snapshot of the user's data across all relevant types.
*   **Loading/Error Handling:** Displays a loading indicator while fetching data and shows an error message if the data retrieval fails.
*   **Summary Display:** Shows the total count of records fetched across all data types.
*   **Report Generation & Download:** Provides distinct buttons for generating reports:
    *   **Excel (`.xlsx`):**
        *   Uses the `xlsx` (SheetJS) library *client-side*.
        *   Creates a new Excel workbook in the browser's memory.
        *   Adds a separate sheet for each data type (Expenses, Income, Accounts, etc.) that contains data.
        *   Formats the data according to predefined headers (translated) and attempts basic type conversions (e.g., dates, currency numbers).
        *   Initiates a file download of the generated `.xlsx` file.
    *   **PDF (`.pdf`):**
        *   Uses the `jspdf` and `jspdf-autotable` libraries *client-side*.
        *   Creates a new PDF document in memory.
        *   Adds a title and user information.
        *   For each data type with data, it generates a table using `jspdf-autotable`, applying basic styling and formatting (dates, currency). Handles page breaks automatically if tables are long.
        *   Initiates a file download of the generated `.pdf` file.
    *   **Individual CSVs:**
        *   Uses the `react-csv` library.
        *   Provides separate download buttons/links for each data type (Expenses, Income, Accounts, etc.).
        *   Each link is configured with the specific data array and corresponding headers for that type.
        *   Clicking a link generates and downloads a `.csv` file containing only that specific data type.

## State Management

*   `ExpenseReports.jsx` uses `useState` primarily for:
    *   `reportData`: Stores the large, consolidated dataset fetched from the API (containing arrays for expenses, income, etc.).
    *   `isLoading`: Boolean flag to track the data fetching state.
    *   `error`: Stores any error message encountered during the data fetch.

## API Interaction

*   `GET /reports/{userId}/all`: Fetches the complete, consolidated data needed for generating all report formats. This is the only backend interaction for this module; report generation itself happens client-side.

## UI Library & Dependencies

*   Material UI (`Container`, `Card`, `CardHeader`, `CardContent`, `Button`, `Typography`, `Box`, `CircularProgress`, `Alert`, `Grid`, `Divider`).
*   `react-csv`: For generating CSV download links.
*   `xlsx` (SheetJS): For client-side Excel file generation.
*   `jspdf` & `jspdf-autotable`: For client-side PDF document and table generation.
*   `date-fns`: Used by helper functions for formatting dates within the generated reports.
*   Uses `constants.js` for translating category names in reports.

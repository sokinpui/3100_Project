# Frontend Module: Settings

## Files

*   `src/modules/Settings.jsx`
*   Uses shared component: `ExpenseNotifications`.
*   Relevant entries in `src/modulesConfig.js` and `src/locales/*.json`.

## Overview

This module provides a central place for users to manage their profile information, application settings (theme and language are handled via Contexts, but triggered here), perform data backups and restores, and configure the backend database connection.

## Key Components

*   **`Settings.jsx`:** A single, comprehensive component that renders different sections within MUI Cards for Profile, Database Configuration, and Data Management. It manages the state and logic for each section.

## Functionality

*   **Profile:**
    *   Loads the current user's profile data (first name, last name, username, email, contact number) from the API.
    *   Displays the data in editable `TextField` components.
    *   Performs basic client-side validation (e.g., valid email format, contact number length, required fields).
    *   Allows users to save updated profile information via a `PUT` request to the API.
*   **Change Password:**
    *   Provides a button ("Change Password") that opens a dialog.
    *   The dialog explains that a password reset link will be sent via email.
    *   Includes a button within the dialog to trigger a `POST` request to the `/request-password-reset` backend endpoint, using the user's currently loaded email address.
    *   Displays feedback (success message or error) after the request is sent. Does *not* handle the actual password change form (that's done via the `/reset-password/:token` route and `ResetPassword.jsx` component).
*   **Database Configuration:**
    *   **Disclaimer:** *This feature allows changing the backend database connection (e.g., switching between the default local SQLite file and a cloud PostgreSQL database). However, this functionality has **not** been thoroughly tested by the development team. Changing these settings, especially providing a custom URL, might lead to unexpected behavior or data issues if not configured correctly. Use with caution!*
    *   Presents radio buttons to select the database type: "Local Database (Default)", "Cloud Database (Online)", or "Custom URL".
    *   If "Custom URL" is selected, a `TextField` appears for the user to input a full SQLAlchemy connection string. Basic client-side URL format validation is attempted.
    *   Provides a "Save Database Setting" button which sends the selected type and custom URL (if applicable) to the `/settings/database` backend endpoint.
    *   Displays a persistent warning message if the settings have been successfully saved, reminding the user that a **full application restart** is required for the changes to take effect.
*   **Data Management:**
    *   **Export:** Provides an "Export All Data" button. Clicking this triggers a `GET` request to `/export/all/{userId}`. The frontend receives the JSON data as a blob and initiates a file download for the user.
    *   **Import:**
        *   Displays a prominent warning about data replacement.
        *   Provides a button to open a file selector, filtering for `.json` files.
        *   Shows the name of the selected file.
        *   Provides an "Import Data" button which first opens a confirmation dialog.
        *   The confirmation dialog re-emphasizes the data deletion aspect.
        *   If confirmed, uploads the selected JSON file via `POST` to `/import/all/{userId}`.
        *   Displays the result message (success/errors) returned from the backend.

## State Management

*   `Settings.jsx` uses `useState` extensively to manage:
    *   `settings`: Holds the loaded profile data and potentially other settings.
    *   Loading states: `isLoading` (profile load), `isExporting`, `isImporting`, `resetRequestLoading`, `dbSettingsLoading`.
    *   Error states: `error` (profile load), `importError`, `dbConfigError`, `resetRequestError`.
    *   `snackbar*`: State for displaying notifications.
    *   Dialog visibility: `passwordDialogOpen`, `confirmImportDialogOpen`.
    *   `resetEmailSent`: Flag for the password reset flow state.
    *   `selectedImportFile`, `importResult`: State for the import file and its outcome.
    *   Database config state: `dbType`, `customDbUrl`, `restartRequired`.
    *   `formErrors`: Holds client-side validation errors for the profile form.

## API Interaction

*   `GET /users/{userId}`: Load user profile data.
*   `PUT /users/{userId}`: Save updated profile data.
*   `POST /request-password-reset`: Initiate the password reset email flow using the loaded user email.
*   `GET /export/all/{userId}`: Trigger backend data export and receive the JSON file blob.
*   `POST /import/all/{userId}`: Upload the selected JSON backup file for data restore/replacement.
*   `PUT /settings/database`: Send the selected database type and custom URL (if applicable) to the backend.

## UI Library

*   Material UI (`Container`, `Card`, `CardHeader`, `CardContent`, `Grid`, `TextField`, `Button`, `Snackbar`, `Alert`, `Dialog`, `DialogActions`, `DialogContent`, `DialogContentText`, `DialogTitle`, `Typography`, `Divider`, `CircularProgress`, `LinearProgress`, `RadioGroup`, `FormControlLabel`, `Radio`, `Collapse`, `AlertTitle`).

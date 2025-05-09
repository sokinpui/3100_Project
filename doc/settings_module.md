# Frontend Module: Settings

## Files

*   `src/modules/Settings.jsx`
*   Uses shared component: `ExpenseNotifications`.
*   Relevant entries in `src/modulesConfig.js` and `src/locales/*.json`.

## Overview

This module provides a central place for users to manage their profile information, change their password (in-app), manage their application licence key, perform data backups and restores (JSON), and configure the backend database connection.

## Key Components

*   **`Settings.jsx`:** A single, comprehensive component that renders different sections within MUI Cards for Profile, Licence Management, Data Management, and Database Configuration. It manages the state and logic for each section, including dialogs for changing the password and confirming data import.

## Functionality

*   **Profile:**
    *   Loads the current user's profile data (first name, last name, username, email, contact number) using `GET /users/{userId}`.
    *   Displays the data in editable `TextField` components.
    *   Performs basic client-side validation (e.g., valid email format, contact number length, required fields).
    *   Allows users to save updated profile information via a `PUT /users/{userId}` request.
*   **Change Password (In-App):**
    *   Provides a "Change Password" button that opens a dedicated dialog.
    *   The dialog prompts the user for their **Current Password**, **New Password**, and **Confirm New Password**.
    *   Includes password visibility toggles.
    *   Performs client-side validation (required fields, new passwords match, basic complexity check).
    *   On confirm, sends a `PUT /users/{userId}/password` request with the current and new passwords.
    *   Displays success or error messages (e.g., "Current password incorrect", "Passwords don't match", "Password changed successfully") within the dialog or via Snackbar.
*   **Licence Management:**
    *   Fetches and displays the current licence key status ("Active", "Inactive", "Not Set") and a masked key prefix using `GET /users/{userId}/licence`.
    *   Provides a `TextField` for the user to enter a new licence key.
    *   Includes an "Update Licence" button.
    *   Performs basic client-side format validation (alphanumeric, hyphens).
    *   On click, sends a `PUT /users/{userId}/licence` request with the entered key.
    *   The backend validates the key against the accepted list.
    *   Displays success or error messages based on the backend response (e.g., "Licence updated", "Invalid key format", "Incorrect key").
    *   Refreshes the displayed status upon successful update.
*   **Data Management:**
    *   **Export:** Provides an "Export All Data" button. On click, it calls `GET /export/all/{userId}`. The backend generates a JSON file containing all user data, and the frontend initiates the download.
    *   **Import:** Provides a file input (`<input type="file">`) restricted to `.json` files. After selecting a file, an "Import Data" button becomes active.
        *   On click, it displays a **critical warning** dialog explaining that importing will **replace all existing data**.
        *   If the user confirms, it sends a `POST /import/all/{userId}` request with the selected JSON file.
        *   Displays the processing result from the backend (success/failure, counts, errors) via Snackbar or Alert.
*   **Database Configuration:**
    *   Provides radio buttons or a select dropdown to choose the database type (`local`, `cloud`, `custom`).
    *   Shows a text field for the `customDbUrl` when "Custom" is selected.
    *   Includes an "Update Database Settings" button.
    *   On click, sends a `PUT /settings/database` request with the chosen type and URL (if applicable).
    *   Displays a persistent warning message that an **application restart is required** for changes to take effect.

## State Management

*   `Settings.jsx` uses `useState` extensively to manage:
    *   `settings`: Holds the loaded profile data.
    *   Loading states: `isLoading` (profile/licence load), `isExporting`, `isImporting`, `dbSettingsLoading`, `isActivating` (licence update), `passwordChangeLoading` (password dialog).
    *   Error states: `error` (profile/licence load), `importError`, `dbConfigError`, `activationError` (licence), `passwordChangeError` (password dialog).
    *   `snackbar*`: State for displaying notifications.
    *   Dialog visibility: `passwordDialogOpen`, `confirmImportDialogOpen`.
    *   `formErrors`: Holds client-side validation errors for the profile form.
    *   Import state: `selectedImportFile`, `importResult`.
    *   Licence state: `licenceKeyInput`, `currentLicenceStatus`, `currentLicenceKeyPrefix`.
    *   Password change dialog state: `currentPassword`, `newPassword`, `confirmNewPassword`, `showCurrentPassword`, `showNewPassword`, `showConfirmPassword`.
    *   Database config state: `dbType`, `customDbUrl`, `restartRequired`.

## API Interaction

*   `GET /users/{userId}`: Load user profile data.
*   `PUT /users/{userId}`: Save updated profile data.
*   `PUT /users/{userId}/password`: Sends current and new password for in-app change.
*   `GET /users/{userId}/licence`: Gets current licence status and masked key prefix.
*   `PUT /users/{userId}/licence`: Submits a new licence key for validation and update.
*   `GET /export/all/{userId}`: Trigger backend data export and receive the JSON file blob for download.
*   `POST /import/all/{userId}`: Upload the selected JSON backup file for data restore/replacement.
*   `PUT /settings/database`: Send the selected database type and custom URL (if applicable) to the backend.

## UI Library

*   Material UI (`Container`, `Card`, `CardHeader`, `CardContent`, `Grid`, `TextField`, `Button`, `Snackbar`, `Alert`, `Dialog`, `DialogActions`, `DialogContent`, `DialogContentText`, `DialogTitle`, `Typography`, `Divider`, `CircularProgress`, `LinearProgress`, `RadioGroup`, `FormControlLabel`, `Radio`, `Collapse`, `AlertTitle`, `IconButton`, `InputAdornment`).


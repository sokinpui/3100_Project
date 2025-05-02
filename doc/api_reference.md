# Backend API Reference

This document provides a high-level overview of the SETA backend API endpoints. For detailed request/response schemas, parameter descriptions, and interactive testing, please run the backend locally and access the Swagger UI at `/docs` or ReDoc at `/redoc`.

The base URL for the API when running locally is typically `http://localhost:8000`.

## Authentication (`/`)

*   `POST /signup`: Creates a new user account. Sends verification email.
*   `POST /login`: Authenticates a user and returns user details upon success.
*   `GET /verify-email/{token}`: Verifies a user's email using the token sent during signup. Activates the account.
*   `POST /request-password-reset`: Sends a password reset link to the user's registered email. (Used for "Forgot Password" flow).
*   `POST /reset-password/{token}`: Allows setting a new password using a valid reset token. (Used when following email link).

## User Profile & Settings (`/users`)

*   `GET /users/{user_id}`: Retrieves a user's profile information.
*   `PUT /users/{user_id}`: Updates a user's profile information (username, email, name, contact).
*   `PUT /users/{user_id}/password`: Changes the user's password (requires current password). **Used for in-app password change.**
*   `GET /users/{user_id}/settings`: Retrieves user application settings (stubbed in backend).
*   `PUT /users/{user_id}/settings`: Updates user application settings (stubbed in backend).
*   `GET /users/{user_id}/licence`: Retrieves the user's current licence key status (active, inactive, not_set) and a masked prefix.
*   `PUT /users/{user_id}/licence`: Updates the user's licence key after validation against the accepted list.

## Expenses (`/expenses`)

*   `GET /expenses/{user_id}`: Retrieves all expenses for a specific user.
*   `POST /expenses`: Creates a new expense record for a user.
*   `PUT /expenses/{expense_id}`: Updates an existing expense record.
*   `DELETE /expenses/{expense_id}`: Deletes a single expense record.
*   `POST /expenses/bulk/delete`: Deletes multiple expense records based on a list of IDs.
*   `POST /expenses/import/{user_id}`: Imports expenses from an uploaded CSV file.
*   `GET /expenses/{user_id}/report`: Generates an expense report (JSON, CSV, XLSX, PDF). (Likely deprecated in favor of `/reports/all`)
*   `GET /expenses/{user_id}/total`: Gets the sum of all expenses for a user.

## Income (`/income`)

*   `GET /income/{user_id}`: Retrieves all income records for a specific user.
*   `POST /income`: Creates a new income record.
*   `DELETE /income/{income_id}`: Deletes a single income record.
*   `POST /income/bulk/delete`: Deletes multiple income records based on a list of IDs.
*   `POST /income/import/{user_id}`: Imports income records from an uploaded CSV file.

## Recurring Expenses (`/recurring`)

*   `GET /recurring/{user_id}`: Retrieves all recurring expense rules for a user.
*   `POST /recurring`: Creates a new recurring expense rule.
*   `DELETE /recurring/{recurring_id}`: Deletes a single recurring expense rule.
*   `POST /recurring/bulk/delete`: Deletes multiple recurring expense rules based on a list of IDs.

## Budgets (`/budgets`)

*   `GET /budgets/{user_id}`: Retrieves all budget rules for a user.
*   `POST /budgets`: Creates a new budget rule.
*   `DELETE /budgets/{budget_id}`: Deletes a single budget rule.
*   `POST /budgets/bulk/delete`: Deletes multiple budget rules based on a list of IDs.

## Goals (`/goals`)

*   `GET /goals/{user_id}`: Retrieves all financial goals for a user.
*   `POST /goals`: Creates a new financial goal.
*   `DELETE /goals/{goal_id}`: Deletes a single financial goal.
*   `POST /goals/bulk/delete`: Deletes multiple financial goals based on a list of IDs.

## Accounts (`/accounts`)

*   `GET /accounts/{user_id}`: Retrieves all accounts (e.g., bank, cash) for a user.
*   `POST /accounts`: Creates a new account.
*   `DELETE /accounts/{account_id}`: Deletes a single account.
*   `POST /accounts/bulk/delete`: Deletes multiple accounts based on a list of IDs. (Note: Fails if account is linked to transactions).

## Data Management (`/export`, `/import`)

*   `GET /export/all/{user_id}`: Exports all user data (expenses, income, recurring, budgets, goals, accounts) as a JSON backup file.
*   `POST /import/all/{user_id}`: Imports all user data from a JSON backup file, **replacing** existing data for that user.

## Reports (`/reports`)

*   `GET /reports/{user_id}/all`: Retrieves a consolidated report containing all data types for a user (used by the standard report export).
*   `POST /reports/{user_id}/custom`: Generates a custom report based on requested data types, date range, and output format (CSV, Excel, PDF). **Requires an active licence key.**

## Settings (`/settings`)

*   `PUT /settings/database`: Updates the backend database configuration (`local`, `cloud`, `custom`). **Requires application restart to take effect.**

## General

*   `GET /`: Root endpoint, returns a welcome message.

---

*Remember to consult the interactive `/docs` endpoint for the most up-to-date and detailed information when the API server is running.*

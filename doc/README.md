# Documentation Index

This directory contains all the documentation for the SETA (Smart Expense Tracker Application) project. Refer to the documents below for user guidance, development procedures, API references, and specific module implementations.

---

## User Guides

*   **[User Manual](./user_manual.md)**
    *   Provides instructions for end-users on how to install, set up, and use the SETA application, covering all major features. Includes licence key information.

---

## Development & Build Process

*   **[Development Workflow](./development_workflow.md)**
    *   Outlines the Git branching strategy (Gitflow-based), pull request process, and release cycle used for the project. Essential reading for contributors.
*   **[Build and Release Guide](./build_and_release.md)**
    *   Details the prerequisites and steps required to set up the development environment, build the backend (PyInstaller) and frontend (Electron) natively, and explains the automated GitHub Actions release workflow triggered by version tags.

---

## Backend Details

*   **[Backend API Reference](./api_reference.md)**
    *   A high-level overview of the FastAPI backend endpoints, covering authentication, data management (CRUD, import/export), reporting, settings, and licence management. Links to the interactive Swagger/ReDoc UI for full details.
*   **[Backend Configuration Guide](./configuration.md)**
    *   Explains how the backend manages configuration, particularly the database connection (local SQLite vs. cloud/custom PostgreSQL), the role of `config_manager.py`, `seta_config.json`, and the `SETA_USER_DATA_PATH` environment variable. Includes the note about the untested nature of the database switching feature.

---

## Frontend Module Implementation

Detailed descriptions of the purpose, components, functionality, state management, and API interactions for each major frontend module:

*   **[Core Layout & Navigation Module](./layout_navigation_module.md)**
    *   Covers `App.jsx`, routing, the sidebar, `modulesConfig.js`, global context providers, and licence-based feature access display.
*   **[Authentication Module](./authentication_module.md)**
    *   Details the Login, Signup, Password Reset (via email link), and AuthGuard components.
*   **[Expense Manager Module](./expense_manager_module.md)**
    *   Explains the components for adding, viewing, and deleting expenses.
*   **[Income Manager Module](./income_manager_module.md)**
    *   Details the components for managing income records.
*   **[Account Manager Module](./account_manager_module.md)**
    *   Covers the UI for managing financial accounts (Checking, Savings, etc.).
*   **[Recurring Manager Module](./recurring_manager_module.md)**
    *   Explains the components for managing recurring expenses/income (bills, subscriptions).
*   **[Planning Manager Module](./planning_manager_module.md)**
    *   Details the tabbed interface for managing Budgets and Goals.
*   **[Settings Module](./settings_module.md)**
    *   Covers the UI for profile management, in-app password change, data export/import (JSON backup/restore), database configuration, and licence key management.
*   **[Expense Import Module](./expense_import_module.md)**
    *   Details the UI for importing expense and income data from CSV files.
*   **[Expense Reports Module](./expense_reports_module.md)**
    *   Explains the UI for generating and downloading standard reports (Excel, PDF, CSVs).
*   **[Custom Reports Module](./custom_report_module.md)**
    *   Details the UI for generating customized reports based on user-selected data types and filters (requires licence).
*   **[Dynamic Dashboard Widgets](./dashboard_widgets.md)**
    *   Provides descriptions for each individual widget available on the customizable dashboard, including the new Income Timeline widget.

---

## Project Design (Internal)

*   **[Design & Implementation Document](./GroupD2_Design_Implementation.docx)**
    *   *(Requires Microsoft Word or compatible software to view)*. Contains detailed internal design choices and implementation strategies developed during the project.

# SETA UI Frontend

This directory contains the React frontend application for SETA, packaged as a desktop application using Electron.

## Overview

The UI provides a user-friendly interface for managing personal finances, interacting with the `seta-api` backend. It features a modular design, a dynamic dashboard, data visualization, and support for internationalization and theming.

## Key Technologies & Libraries

*   **React:** JavaScript library for building user interfaces.
*   **Electron:** Framework for creating native desktop applications with web technologies.
*   **React Router:** For handling navigation within the application.
*   **Material UI (MUI):** React component library for UI design and theming.
*   **axios:** For making HTTP requests to the backend API.
*   **Recharts:** Composable charting library for data visualization in the dashboard.
*   **react-grid-layout:** Draggable and resizable grid layout for the dynamic dashboard.
*   **i18next & react-i18next:** Framework for internationalization (English, Chinese).
*   **date-fns & Day.js:** Libraries for date/time manipulation and formatting.
*   **jsPDF & xlsx:** Libraries used for client-side report generation (PDF, Excel).
*   **react-csv:** Used for client-side CSV report generation.
*   **uuid:** For generating unique IDs (e.g., for dashboard widgets).

## Features

*   **User Authentication:** Login, Signup, Password Reset flows.
*   **Modular Interface:** Features are organized into distinct modules (Expenses, Income, Accounts, Planning, Recurring, Reports, Settings, Import).
*   **Dynamic Dashboard:**
    *   Customizable grid layout using `react-grid-layout`.
    *   Variety of widgets for data visualization (Charts, Summaries, Lists) using `Recharts` and custom components.
    *   Time period selection and data filtering capabilities.
*   **Data Management:**
    *   CRUD interfaces for Expenses, Income, Accounts, Budgets, Goals, Recurring Items.
    *   Bulk deletion options in lists.
*   **Data Import/Export:**
    *   CSV import for Expenses and Income.
    *   Full data backup/restore via JSON (handled in Settings).
    *   Comprehensive report generation (Excel, PDF, individual CSVs).
*   **Settings:** User profile management, theme switching (Light/Dark/System), language selection (English/Chinese), data backup/restore, database configuration (triggers backend change).
*   **Theming:** Light and Dark themes using Material UI, persisting user preference in `localStorage`.
*   **Internationalization:** UI text translated into English and Chinese using `i18next`, persisting user preference.

## Project Structure (`src/`)

*   `App.jsx`: Root application component, sets up providers and routing.
*   `assets/`: Stylesheets (`*.css`) and theme definitions (`theme.js`).
*   `components/`: Reusable UI components.
    *   `common/`: General components like `Sidebar`, `LoadingSpinner`.
    *   `Dashboard/`: Layout components (`LayoutContainer`, `ModuleRouter`).
*   `constants.js`: Application-wide constants (e.g., expense categories, icons).
*   `contexts/`: React context providers for global state (Theme, Language, API, Modules).
*   `locales/`: Translation JSON files (`en.json`, `zh.json`) and i18n configuration (`i18n.jsx`).
*   `login/`: Components related to authentication (`Login.jsx`, `Signup.jsx`, `AuthGuard.jsx`).
*   `modules/`: Feature-specific components corresponding to main application sections.
    *   `DynamicDashboard/`: Core dashboard logic and widget components.
    *   `ExpenseManager/`, `IncomeManager/`, etc.: Components for managing specific data types.
*   `modulesConfig.js`: Defines application modules, routes, and sidebar menu items.
*   `services/`: API interaction logic (`ApiProvider`, `apiService.js`, `useApi.js`).
*   `utils/`: Utility components and hooks (`T.jsx` for translation, `useLocalizedDateFormat.js`).
*   `index.js`: Entry point for the React application.

## Setup

1.  **Navigate:** Ensure you are in the `seta-ui/` directory.
2.  **Install Dependencies:**
    ```bash
    npm install
    ```

## Development

1.  **Run Backend:** Make sure the `seta-api` backend development server is running (usually on `http://localhost:8000`).
2.  **Run Frontend:** Start the React development server:
    ```bash
    npm start
    ```
    This will typically open the application in your default web browser (usually at `http://localhost:3000`). The frontend will make API calls to the backend server specified in its service configuration (defaults to `http://localhost:8000`). Hot-reloading is enabled.

## Building the Application

1.  **React Build:** To create an optimized production build of the React code:
    ```bash
    npm run build
    ```
    The output will be in the `build/` directory. This step is usually automatically performed by the Electron build process.

2.  **Package with Electron:** To build the native desktop application (including the React build and potentially the pre-built backend):
    *   Refer to the main project [Build and Release Guide](../doc/build_and_release.md) for detailed cross-platform instructions.
    *   Ensure the backend (`seta-api`) has been built natively for the target OS first (`cd ../seta-api && pyinstaller seta_api_server.spec`).
    *   Run the appropriate command from the `seta-ui/` directory:
        ```bash
        # Example for macOS:
        npm run electron:build -- --mac

        # Example for Windows:
        npm run electron:build -- --win

        # Example for Linux:
        npm run electron:build -- --linux
        ```
    *   The packaged application will be output to the `seta-ui/release/` directory.
    *   **Configuration:** The `package.json` file contains settings for `electron-builder`, including application metadata and instructions on how to package extra resources like the native backend executable. Verify the `extraResources` configuration correctly points to `../seta-api/dist/seta_api_server/`.

## Electron Integration (`public/electron.js`)

*   The `public/electron.js` file contains the main process logic for the Electron application.
*   It handles creating the browser window, loading the React frontend (`index.html`), and managing inter-process communication (IPC).
*   **Crucially:** This script is responsible for spawning the native `seta-api` backend process when the Electron app starts. It **must** set the `SETA_USER_DATA_PATH` environment variable when launching the backend, pointing it to the Electron app's user data directory (e.g., using `app.getPath('userData')`) so the backend can store its configuration and local database correctly.

## State Management & Context

*   Global state like the current theme and language is managed using React Context (`ThemeContext`, `LanguageContext`).
*   User preferences for theme and language are persisted in `localStorage`.
*   API interaction is facilitated through `ApiProvider` and the `axios` instance.
*   Module definitions and routing information are centralized in `modulesConfig.js` and accessed via `ModuleContext`.

## Styling

*   **Material UI (MUI):** Provides the core component library and styling system.
*   **Theming:** Uses MUI's theming capabilities (`createTheme`) defined in `assets/styles/theme.js` for light and dark modes.
*   **CSS:** Global styles are defined in `assets/styles/global.css`. Component-specific or legacy styles might exist in other `.css` files.

## Internationalization (i18n)

*   Uses `i18next` and `react-i18next`.
*   Translations are stored in `locales/en.json` and `locales/zh.json`.
*   The `T.jsx` component is a simple wrapper around the `useTranslation` hook for easy text translation in JSX.
*   Language preference is stored in `localStorage` and detected on startup.

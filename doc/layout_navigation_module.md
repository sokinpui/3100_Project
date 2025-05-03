
# Frontend Module: Core Layout & Navigation

## Files

*   `src/App.jsx`
*   `src/components/Dashboard/LayoutContainer.jsx`
*   `src/components/Dashboard/ModuleRouter.jsx`
*   `src/components/common/Sidebar.jsx`
*   `src/modulesConfig.js`
*   `src/contexts/ThemeContext.jsx`
*   `src/contexts/LanguageContext.jsx`
*   `src/contexts/ModuleContext.jsx`
*   `src/services/ApiProvider.jsx`

## Overview

This module sets up the main application structure, including routing, the persistent sidebar, global context providers (Theme, Language, API), and the container for displaying feature modules. It also handles visual cues for features requiring specific conditions (like an active licence).

## Key Components

*   **`App.jsx`:** Root component. Initializes context providers (`I18nextProvider`, `ThemeProvider`, `LanguageProvider`, `ApiProvider`, `ModuleProvider`), sets up the `HashRouter`, and renders `AuthGuard` and `LayoutContainer`. Checks initial login status.
*   **`LayoutContainer.jsx`:** A simple wrapper that renders the `ModuleRouter`, effectively defining the main content area next to the sidebar.
*   **`ModuleRouter.jsx`:** Defines application routes based on `modulesConfig.js`. Uses `React Router` (`Routes`, `Route`) and `React.Suspense` for lazy loading components. Wraps protected routes within the `Sidebar` component using a `ProtectedRoute` HOC. Redirects users based on authentication status.
*   **`Sidebar.jsx`:** Persistent sidebar component displayed for authenticated users.
    *   Fetches the user's licence status from the backend (`GET /users/{userId}/licence`).
    *   Renders navigation links based on `sidebarMenuItems` from `modulesConfig.js`.
    *   Conditionally renders or adds visual indicators (e.g., lock icon, tooltip) to menu items that require an active licence (like "Custom Reports"), based on the fetched `licenceStatus` and the `requiresLicence` flag in `modulesConfig.js`.
    *   Includes toggles for theme and language, user profile information display (username/email from `localStorage`), and a logout button with confirmation.
    *   Adapts its width (collapsed/expanded).
*   **`modulesConfig.js`:** Central configuration file defining all application modules (public and protected), their paths, associated components (lazy-loaded), icons, whether they appear in the sidebar, and **whether they require an active licence**.
*   **Context Providers:** (`ThemeProvider`, `LanguageProvider`, `ApiProvider`, `ModuleProvider`) Wrap the application to provide global access to theme, language, API instance, and module definitions.

## Functionality

*   Provides the main application frame (Sidebar + Content Area).
*   Handles routing between different feature modules using `HashRouter`.
*   Lazy loads module components for better initial performance.
*   Protects routes requiring authentication via `AuthGuard` and `ProtectedRoute`.
*   Manages and persists global theme and language settings.
*   Provides a global Axios instance for API calls via `ApiProvider`.
*   Allows users to logout via the Sidebar.
*   **Visually indicates (in the Sidebar) which features require an active licence and restricts access based on fetched licence status.**

## State Management

*   Global theme and language state managed via `ThemeContext` and `LanguageContext`, persisted in `localStorage`.
*   Sidebar uses `useState` for its open/closed state, dialog visibility, and **licence status (`licenceStatus`)**.
*   `AuthGuard` uses `useState` (passed via prop) to signal login status to `App.jsx`.

## API Interaction

*   Primarily facilitates API calls made by child modules through the `ApiProvider` context.
*   **Sidebar fetches licence status: `GET /users/{userId}/licence`**.
*   Sidebar reads user info directly from `localStorage`. Logout clears relevant `localStorage` items.

## UI Library

*   Material UI (`Box`, `Drawer`, `List`, `ListItem`, `ListItemIcon`, `ListItemText`, `Button`, `Dialog`, `Avatar`, `IconButton`, `Tooltip`, `Menu`, `MenuItem`, `CircularProgress`, `LockIcon`).
*   React Router (`HashRouter`, `Routes`, `Route`, `Navigate`, `useNavigate`, `useLocation`, `Link`).


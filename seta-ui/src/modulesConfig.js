// src/modulesConfig.js
import { lazy } from 'react';

// Lazy load components for better performance and code splitting
const Login = lazy(() => import('./login/Login'));
// const Dashboard = lazy(() => import('./modules/Dashboard/Dashboard'));
const DynamicDashboard = lazy(() => import('./modules/DynamicDashboard/DynamicDashboard')); // <-- Import new module
const ExpenseManager = lazy(() => import('./modules/ExpenseManager/ExpenseManager'));
const ExpenseReports = lazy(() => import('./modules/ExpenseReports')); // Assuming default export
const Settings = lazy(() => import('./modules/Settings')); // Assuming default export
// Import PageNotFound if you intend to use it as a route component
// const PageNotFound = lazy(() => import('./components/common/PageNotFound'));

export const appModules = [
  // Public route definition
  {
    id: 'login',
    path: '/login',
    component: Login,
    isPublic: true // Flag for public access
  },
  // Authenticated routes (will be wrapped by Sidebar via ProtectedRoute)
  // Note: ModuleRouter.jsx handles '/' separately, so this might not be strictly needed here
  // unless you want Dashboard to be part of the dynamic mapping too.
  // {
  //   id: 'dashboard',
  //   path: '/', // Redundant with the explicit '/' route in ModuleRouter? Check usage.
  //   component: Dashboard
  // },
  {
    id: 'dynamic-dashboard', // Unique ID
    path: '/dynamic-dashboard', // URL path for the module
    component: DynamicDashboard // The component to render
  },
  {
    id: 'manage-expenses',
    path: '/manage-expenses',
    component: ExpenseManager
  },
  {
    id: 'reports',
    path: '/reports',
    component: ExpenseReports
  },
  {
    id: 'settings',
    path: '/settings',
    component: Settings
  },
  // Example: Catch-all route for 404, rendered within ProtectedRoute if placed here
  // {
  //   id: 'not-found',
  //   path: '*', // Matches any path not matched above
  //   component: PageNotFound
  // }
];

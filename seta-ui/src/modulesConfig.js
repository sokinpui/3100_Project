// src/modulesConfig.js
import React from 'react';

// --- Import Icons ---
import DashboardIcon from '@mui/icons-material/Dashboard'; // Changed from ViewQuiltIcon for consistency
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'; // Used for Expense Manager
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'; // Used for Income Manager
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'; // Used for Account Manager
import EventRepeatIcon from '@mui/icons-material/EventRepeat'; // Used for Recurring Manager
import EditCalendarIcon from '@mui/icons-material/EditCalendar'; // Used for Planning Manager
import AssessmentIcon from '@mui/icons-material/Assessment'; // Used for Export All / Standard Reports
import QueryStatsIcon from '@mui/icons-material/QueryStats'; // Used for Custom Reports
import FileUploadIcon from '@mui/icons-material/FileUpload'; // Used for Import Data
import SettingsIcon from '@mui/icons-material/Settings'; // Used for Settings
import LoginIcon from '@mui/icons-material/Login'; // Used for Login
import PersonAddIcon from '@mui/icons-material/PersonAdd'; // Used for Signup
import LockResetIcon from '@mui/icons-material/LockReset'; // Used for Reset Password
import ErrorIcon from '@mui/icons-material/Error'; // Used for Page Not Found

export const appModules = [
  // --- Public Routes ---
  {
    id: 'login',
    name: 'Login', // Internal name, not shown in sidebar
    path: '/login',
    component: React.lazy(() => import('./login/Login')),
    isPublic: true,
    icon: <LoginIcon />, // Icon might be used elsewhere
  },
  {
    id: 'signup',
    name: 'Signup', // Internal name
    path: '/signup',
    component: React.lazy(() => import('./login/Signup')),
    isPublic: true,
    icon: <PersonAddIcon />,
  },
  {
    id: 'reset-password',
    name: 'Reset Password', // Internal name
    path: '/reset-password/:token',
    component: React.lazy(() => import('./modules/ResetPassword')),
    isPublic: true,
    icon: <LockResetIcon />,
  },

  // --- Protected Routes (will appear in sidebar if icon is provided) ---
  {
    id: 'dynamic-dashboard',
    name: 'sidebar.dynamicDashboard', // Translation key for sidebar text
    path: '/dynamic-dashboard',
    component: React.lazy(() => import('./modules/DynamicDashboard/DynamicDashboard')),
    isProtected: true,
    icon: <DashboardIcon />,
  },
  {
    id: 'expense-manager',
    name: 'sidebar.newExpenseManager', // Translation key
    path: '/manage-expenses',
    component: React.lazy(() => import('./modules/ExpenseManager/ExpenseManager')),
    isProtected: true,
    icon: <ReceiptLongIcon />, // Changed from AddCardIcon
  },
  {
    id: 'income-manager', // Renamed ID
    name: 'sidebar.income', // Translation key
    path: '/manage-income', // Renamed path
    component: React.lazy(() => import('./modules/IncomeManager/IncomeManager')),
    isProtected: true,
    icon: <AttachMoneyIcon />,
  },
  {
    id: 'account-manager', // Renamed ID
    name: 'sidebar.accounts', // Translation key
    path: '/manage-accounts', // Renamed path
    component: React.lazy(() => import('./modules/AccountManager/AccountManager')),
    isProtected: true,
    icon: <AccountBalanceWalletIcon />,
  },
  {
    id: 'recurring-manager', // Renamed ID
    name: 'sidebar.recurring', // Translation key
    path: '/manage-recurring', // Renamed path
    component: React.lazy(() => import('./modules/RecurringManager/RecurringManager')),
    isProtected: true,
    icon: <EventRepeatIcon />,
  },
  {
    id: 'planning-manager', // Renamed ID
    name: 'sidebar.planning', // Translation key
    path: '/planning', // Renamed path
    component: React.lazy(() => import('./modules/PlanningManager/PlanningManager')),
    isProtected: true,
    icon: <EditCalendarIcon />, // Changed Icon
  },
  {
    id: 'expense-reports', // Keep ID for standard reports
    name: 'sidebar.reports', // Translation key (label for standard export)
    path: '/reports',
    component: React.lazy(() => import('./modules/ExpenseReports')),
    isProtected: true,
    icon: <AssessmentIcon />,
  },
  {
    id: 'custom-reports',
    name: 'sidebar.customReports', // Translation key (add this key to en.json/zh.json)
    path: '/custom-reports',
    component: React.lazy(() => import('./modules/CustomReport/CustomReport.jsx')),
    isProtected: true, // Still protected by login
    icon: <QueryStatsIcon />,
    requiresLicence: true // Flag for sidebar logic
  },
  {
    id: 'expense-import', // Keep ID for import
    name: 'sidebar.importData', // Renamed translation key to match path/function
    path: '/import-data', // Renamed path
    component: React.lazy(() => import('./modules/ExpenseImport/ExpenseImport')),
    isProtected: true,
    icon: <FileUploadIcon />, // Changed from ImportExportIcon
  },
  {
    id: 'settings',
    name: 'sidebar.settings', // Translation key
    path: '/settings',
    component: React.lazy(() => import('./modules/Settings')),
    isProtected: true,
    icon: <SettingsIcon />,
  },

  // --- Catch-all Route ---
  {
    id: 'page-not-found',
    name: 'Page Not Found', // Internal name
    path: '*',
    component: React.lazy(() => import('./components/common/PageNotFound')),
    icon: <ErrorIcon />, // Icon might be used elsewhere
  },
];

// Generate sidebar items from the protected routes that have an icon
export const sidebarMenuItems = appModules
  .filter(module => module.isProtected && module.icon) // Filter for protected routes with icons
  .map(module => ({
    text: module.name, // This is the translation key
    icon: module.icon,
    path: module.path,
    requiresLicence: module.requiresLicence || false, // Pass the licence flag
  }));

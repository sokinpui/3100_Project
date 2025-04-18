// src/modulesConfig.js
import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCardIcon from '@mui/icons-material/AddCard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ErrorIcon from '@mui/icons-material/Error';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import SavingIcon from '@mui/icons-material/Assessment';

export const appModules = [
  {
    id: 'login',
    name: 'Login',
    path: '/login',
    component: React.lazy(() => import('./login/Login')),
    isPublic: true,
    icon: <LoginIcon />,
  },
  {
    id: 'signup',
    name: 'Signup',
    path: '/signup',
    component: React.lazy(() => import('./login/Signup')),
    isPublic: true,
    icon: <PersonAddIcon />,
  },
  {
    id: 'dynamic-dashboard',
    name: 'sidebar.dynamicDashboard',
    path: '/dynamic-dashboard',
    component: React.lazy(() => import('./modules/DynamicDashboard/DynamicDashboard')),
    isProtected: true,
    icon: <ViewQuiltIcon />,
  },
  {
    id: 'manage-expenses',
    name: 'sidebar.newExpenseManager',
    path: '/manage-expenses',
    component: React.lazy(() => import('./modules/ExpenseManager/ExpenseManager')),
    isProtected: true,
    icon: <AddCardIcon />,
  },
  {
    id: 'expense-import',
    name: 'sidebar.importExpenses',
    path: '/import-expenses',
    component: React.lazy(() => import('./modules/ExpenseImport/ExpenseImport')),
    isProtected: true,
    icon: <ImportExportIcon />,
  },
  {
    id: 'expense-report',
    name: 'sidebar.reports',
    path: '/reports',
    component: React.lazy(() => import('./modules/ExpenseReports')),
    isProtected: true,
    icon: <AssessmentIcon />,
  },
  {
    id: 'income', // New ID
    name: 'sidebar.income', // New translation key
    path: '/income', // New path
    component: React.lazy(() => import('./modules/IncomeManager/IncomeManager')), // New component path
    isProtected: true,
    icon: <AttachMoneyIcon />, // Use an appropriate icon
  },
  {
    id: 'recurring', // New ID
    name: 'sidebar.recurring', // New translation key
    path: '/recurring', // New path
    component: React.lazy(() => import('./modules/RecurringManager/RecurringManager')), // New component path
    isProtected: true,
    icon: <EventRepeatIcon />, // Use the icon
  },
  {
    id: 'planning', // New ID for combined module
    name: 'sidebar.planning', // New translation key
    path: '/planning', // New path
    component: React.lazy(() => import('./modules/PlanningManager/PlanningManager')), // New component path
    isProtected: true,
    icon: <AssessmentIcon />, // Choose an icon
  },
  {
    id: 'accounts', // New ID
    name: 'sidebar.accounts', // New translation key
    path: '/accounts', // New path
    component: React.lazy(() => import('./modules/AccountManager/AccountManager')), // New component path
    isProtected: true,
    icon: <AccountBalanceWalletIcon />, // Use the icon
  },
  {
    id: 'settings',
    name: 'sidebar.settings',
    path: '/settings',
    component: React.lazy(() => import('./modules/Settings')),
    isProtected: true,
    icon: <SettingsIcon />,
  },
  {
    id: 'page-not-found',
    name: 'Page Not Found',
    path: '*',
    component: React.lazy(() => import('./components/common/PageNotFound')),
    icon: <ErrorIcon />,
  },
  {
    id: 'reset-password',
    name: 'Reset Password', // Name used internally or potentially for titles
    path: '/reset-password/:token', // Route with token parameter
    component: React.lazy(() => import('./modules/ResetPassword')), // Path to your new component
    isPublic: true, // Accessible without login
    // icon: <LockResetIcon />, // Optional: Icon if you ever need to reference it
  },
];

export const sidebarMenuItems = appModules
  .filter(module => module.isProtected && module.icon)
  .map(module => ({
    text: module.name,
    icon: module.icon,
    path: module.path,
  }));

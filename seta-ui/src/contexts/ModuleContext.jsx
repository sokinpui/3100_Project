import React, { createContext, useContext } from 'react';

const ModuleContext = createContext();

export const ModuleProvider = ({ children }) => {

  // isPublic and isProtected are used to check in ModuleRouter.jsx
  const modules = [
    {
      id: 'login',
      name: 'Login',
      path: '/login',
      component: React.lazy(() => import('../login/Login')),
      isPublic: true,
    },
    // {
    //   id: 'expense-add',
    //   name: 'Add Expense',
    //   path: '/add-expense',
    //   component: React.lazy(() => import('../modules/ExpenseManage.jsx')),
    //   isProtected: true,
    // },
      {
          id: 'manage-expenses',
          name: 'New add Expenses',
          path: '/manage-expenses',
          component: React.lazy(() => import('../modules/ExpenseManager/ExpenseManager.jsx')),
          isProtected: true,
      },
    {
      id: 'expense-report',
      name: 'View Reports',
      path: '/reports',
      component: React.lazy(() => import('../modules/ExpenseReports.jsx')),
      isProtected: true,
    },
    {
      id: 'page-not-found',
      name: 'Page Not Found',
      path: '*',
      component: React.lazy(() => import('../components/common/PageNotFound.jsx')),
    },
    {
      id: 'signup',
      name: 'Signup',
      path: '/signup',
      component: React.lazy(() => import('../login/Signup')),
      isPublic: true,
    },
    {
      id: 'reset-password',
      name: 'Reset Password',
      path: '/reset-password/:token',
      component: React.lazy(() => import('../modules/ResetPassword')),
      isPublic: true,
    },
    {
      id: 'settings',
      name: 'Settings',
      path: '/settings',
      component: React.lazy(() => import('../modules/Settings.jsx')),
    }
  ];

  return (
    <ModuleContext.Provider value={{ modules }}>
      {children}
    </ModuleContext.Provider>
  );
};

export const useModules = () => useContext(ModuleContext);

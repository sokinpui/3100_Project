import React, { createContext, useContext } from 'react';

const ModuleContext = createContext();

export const ModuleProvider = ({ children }) => {
  const modules = [
    {
      id: 'login',
      name: 'Login',
      path: '/login',
      component: React.lazy(() => import('../login/Login')),
      isPublic: true,
    },
    {
      id: 'expense-add',
      name: 'Add Expense',
      path: '/add-expense',
      component: React.lazy(() => import('../modules/ExpenseAdd/ExpenseAdd.jsx')),
      isProtected: true,
    },
    {
      id: 'expense-report',
      name: 'View Reports',
      path: '/reports',
      component: React.lazy(() => import('../modules/ExpenseReports/ExpenseReports.jsx')),
      isProtected: true,
    },
  ];

  return (
    <ModuleContext.Provider value={{ modules }}>
      {children}
    </ModuleContext.Provider>
  );
};

export const useModules = () => useContext(ModuleContext);

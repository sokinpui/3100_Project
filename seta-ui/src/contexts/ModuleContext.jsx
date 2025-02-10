import React, { createContext, useContext } from 'react'; // Add this line

const ModuleContext = createContext();

export const ModuleProvider = ({ children }) => {
  const modules = [
    {
      id: 'expense-add',
      name: 'Add Expense',
      path: '/add-expense',
      component: React.lazy(() => import('../modules/ExpenseAdd/ExpenseAdd.jsx')),
    },
    {
      id: 'expense-report',
      name: 'View Reports',
      path: '/reports',
      component: React.lazy(() => import('../modules/ExpenseReports/ExpenseReports.jsx')),
    },
  ];

  return (
    <ModuleContext.Provider value={{ modules }}>
      {children}
    </ModuleContext.Provider>
  );
};

export const useModules = () => useContext(ModuleContext);

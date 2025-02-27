import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import LayoutContainer from './components/Dashboard/LayoutContainer.jsx';
import { ModuleProvider } from './contexts/ModuleContext';
import ApiProvider from './services/ApiProvider';
import AuthGuard from './login/AuthGuard';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('loginTime');
    setIsLoggedIn(!!session);
  }, []);

  return (
    <Router>
      <ApiProvider baseUrl="https://api.setapp.com">
        <ModuleProvider>
          <AuthGuard setIsLoggedIn={setIsLoggedIn} />
          <LayoutContainer />
        </ModuleProvider>
      </ApiProvider>
    </Router>
  );
}
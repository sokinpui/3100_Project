import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import { ModuleProvider } from './contexts/ModuleContext';
import ApiProvider from './services/ApiProvider';
import AuthGuard from './login/AuthGuard';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <Router>
      <ApiProvider baseUrl="https://api.setapp.com">
        <ModuleProvider>
          <AuthGuard isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          <Dashboard />
        </ModuleProvider>
      </ApiProvider>
    </Router>
  );
}
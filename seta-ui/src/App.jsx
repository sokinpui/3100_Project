import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import { ModuleProvider } from './contexts/ModuleContext';
import ApiProvider from './services/ApiProvider';
import Sidebar from './components/common/Sidebar';
import Login from './login/Login';
import AuthGuard from './login/AuthGuard';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [redirectToHome, setRedirectToHome] = useState(false); // New state

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setRedirectToHome(true); // Trigger redirect
  };

  return (
    <Router>
      <ApiProvider baseUrl="https://api.setapp.com">
        <ModuleProvider>
          <AuthGuard isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          {isLoggedIn ? (
            <Sidebar>
              <Dashboard />
            </Sidebar>
          ) : (
            <Login onLogin={handleLoginSuccess} />
          )}
          {redirectToHome && <RedirectHome />} 
        </ModuleProvider>
      </ApiProvider>
    </Router>
  );
}

function RedirectHome() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/', { replace: true });
  }, []);

  return null;
}
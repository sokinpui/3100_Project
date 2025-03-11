import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import LayoutContainer from './components/Dashboard/LayoutContainer.jsx';
import { ModuleProvider } from './contexts/ModuleContext';
import ApiProvider from './services/ApiProvider';
import AuthGuard from './login/AuthGuard';
// import './locales/i18n';
//
import { ThemeProvider } from "./contexts/ThemeContext";
import ModuleRouter from "./components/Dashboard/ModuleRouter";
// In App.jsx or index.js
import './assets/styles/global.css';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('loginTime');
    setIsLoggedIn(!!session);
  }, []);

  return (
    <ThemeProvider>
      <ApiProvider>
        <Router>
          <ModuleProvider>
            <AuthGuard setIsLoggedIn={setIsLoggedIn} />
            <LayoutContainer />
          </ModuleProvider>
        </Router>
      </ApiProvider>
    </ThemeProvider>
  );
}

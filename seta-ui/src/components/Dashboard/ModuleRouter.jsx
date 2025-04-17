// components/Dashboard/ModuleRouter.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import Sidebar from '../common/Sidebar';

export default function ModuleRouter({ modules }) {
  const loginTime = localStorage.getItem('loginTime');
  const isAuthenticated = !!loginTime; // Ensure boolean conversion

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? <Sidebar>{children}</Sidebar> : <Navigate to="/login" replace />;
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {modules.map((module) => {
          if (module.isPublic) {
            // Special handling for public routes:
            // Only redirect logged-in users AWAY from login/signup
            if (isAuthenticated && (module.path === '/login' || module.path === '/signup')) {
              return (
                <Route
                  key={module.id}
                  path={module.path}
                  // Change redirect target to the main dashboard page
                  element={<Navigate to="/dynamic-dashboard" replace />}
                />
              );
            } else {
              // Allow access to other public routes (like reset-password) regardless of auth status
              return (
                <Route
                  key={module.id}
                  path={module.path}
                  element={<module.component />}
                />
              );
            }
          } else { // Protected routes
            return (
              <Route
                key={module.id}
                path={module.path}
                element={
                  <ProtectedRoute>
                    <module.component />
                  </ProtectedRoute>
                }
              />
            );
          }
        })}
        {/* Optional: Add a default route for authenticated users if '/' isn't handled */}
        {/* If you uncomment this, make sure it also points to /dynamic-dashboard */}
        {/* <Route path="/" element={isAuthenticated ? <Navigate to="/dynamic-dashboard" replace /> : <Navigate to="/login" replace />} /> */}
      </Routes>
    </Suspense>
  );
}

// components/Dashboard/ModuleRouter.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import DefaultDashboardView from './DefaultDashboardView';
import Sidebar from '../common/Sidebar';

export default function ModuleRouter({ modules }) {
  const token = localStorage.getItem('authToken');
  const loginTime = localStorage.getItem('loginTime');
  const isAuthenticated = token && loginTime;

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? <Sidebar>{children}</Sidebar> : <Navigate to="/login" replace />;
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {modules.map((module) => {
          if (module.isPublic) {    {/* This is for the login route */}
          {/* isAuthenticated: already logged in, if change url to /login will auto redirect back to root "/" */}
          {/* else: direct to login page */}
            return (
              <Route
                key={module.id}
                path={module.path}
                element={                 
                  isAuthenticated ? (       
                    <Navigate to="/" replace />
                  ) : (
                    <module.component />
                  )
                }
              />
            );
          }

          {/* This returns the side bar and other components (including PageNotFound) */}
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
        })}

        {/* This is for the root page */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DefaultDashboardView />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}

// components/Dashboard/ModuleRouter.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import DefaultDashboardView from './DefaultDashboardView';
import Sidebar from '../common/Sidebar';

export default function ModuleRouter({ modules }) {
  const isAuthenticated = !!localStorage.getItem('authToken');

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? <Sidebar>{children}</Sidebar> : <Navigate to="/login" replace />;
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {modules.map((module) => {
          if (module.isPublic) {
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

// components/Dashboard/ModuleRouter.jsx
import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import DefaultDashboardView from './DefaultDashboardView'; // <-- Add this line

export default function ModuleRouter({ modules }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {modules.map((module) => (
          <Route
            key={module.id}
            path={module.path}
            element={<module.component />}
          />
        ))}
        <Route path="/" element={<DefaultDashboardView />} />
      </Routes>
    </Suspense>
  );
}

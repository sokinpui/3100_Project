// src/components/Dashboard/LayoutContainer.jsx
import ModuleRouter from './ModuleRouter';
import { appModules } from '../../modulesConfig';

export default function LayoutContainer() {
  return (
    <div className="dashboard-container">
      <main className="module-container">
        <ModuleRouter modules={appModules} />
      </main>
    </div>
  );
}

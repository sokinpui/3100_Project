// src/components/Dashboard/LayoutContainer.jsx
// Remove unused import if ModuleContext is no longer used here
// import { useModules } from '../../contexts/ModuleContext';
import ModuleRouter from './ModuleRouter';
import { appModules } from '../../modulesConfig'; // <-- Import the modules configuration

export default function LayoutContainer() {
  // Remove unused context hook call if applicable
  // const { modules } = useModules();

  return (
    // Keep className if used for styling
    <div className="dashboard-container">
      {/* Header/Nav comments kept as per original */}
      {/* <header className="app-header">
        <h1>Smart Expense Tracker</h1>
      </header> */}
      {/* <nav className="module-nav">
        <ModuleGrid modules={modules} />
      </nav> */}

      <main className="module-container">
        {/* Pass the imported appModules array to the router */}
        <ModuleRouter modules={appModules} />
      </main>
    </div>
  );
}

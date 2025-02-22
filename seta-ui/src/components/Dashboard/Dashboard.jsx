import { useModules } from '../../contexts/ModuleContext';
import ModuleRouter from './ModuleRouter';

export default function Dashboard() {
  const { modules } = useModules();

  return (
    <div className="dashboard-container">
      {/* <header className="app-header">
        <h1>Smart Expense Tracker</h1>
      </header> */}

      {/* <nav className="module-nav">
        <ModuleGrid modules={modules} />
      </nav> */}

      <main className="module-container"> 
        <ModuleRouter modules={modules} />
      </main>
    </div>
  );
}

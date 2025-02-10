// App.jsx (Main Entry)
import { BrowserRouter as Router } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import { ModuleProvider } from './contexts/ModuleContext';
import ApiProvider from './services/ApiProvider';

export default function App() {
  return (
    <Router>
      <ApiProvider baseUrl="https://api.setapp.com">
        <ModuleProvider>
          <Dashboard />
        </ModuleProvider>
      </ApiProvider>
    </Router>
  );
}

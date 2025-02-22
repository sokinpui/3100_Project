// components/Dashboard/ModuleGrid.jsx
import { Link } from 'react-router-dom';

export default function ModuleGrid({ modules }) {
  return (
    <div className="module-grid">
      <Link to ="/" className="module-card">
        <h3>Home</h3>
      </Link>
      {modules.map((module) => (
        <Link
          key={module.id}
          to={module.path}
          className="module-card"
        >
          <h3>{module.name}</h3>
        </Link>
      ))}
    </div>
  );
}

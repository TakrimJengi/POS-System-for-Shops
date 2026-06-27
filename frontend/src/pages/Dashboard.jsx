import { useNavigate } from 'react-router-dom';
import { getUserFromToken, isAdmin, logout } from '../services/auth';

function Dashboard() {
  const navigate = useNavigate();
  const user = getUserFromToken();
  const admin = isAdmin();

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>POS Dashboard</h1>
        <div>
          <span style={{ marginRight: '1rem', color: '#555' }}>
            Logged in as: <strong>{admin ? 'Admin' : 'Cashier'}</strong>
          </span>
          <button onClick={logout} style={{ padding: '0.5rem 1rem', background: '#c0392b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>

        <DashboardCard title="Sales" description="Process a new sale" onClick={() => navigate('/sales')} />
        <DashboardCard title="Products" description="View product catalog" onClick={() => navigate('/products')} />
        <DashboardCard title="Categories" description="View categories" onClick={() => navigate('/categories')} />
        <DashboardCard title="Inventory" description="Check stock levels" onClick={() => navigate('/inventory')} />

        {admin && (
          <>
            <DashboardCard title="Accounting" description="Income, expenses, profit" onClick={() => navigate('/accounting')} />
            <DashboardCard title="User Management" description="Manage staff accounts" onClick={() => navigate('/users')} />
          </>
        )}

      </div>
    </div>
  );
}

function DashboardCard({ title, description, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1.5rem',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
      }}
    >
      <h3 style={{ margin: '0 0 0.5rem 0', color: '#2E6DA4' }}>{title}</h3>
      <p style={{ margin: 0, color: '#777', fontSize: '0.9rem' }}>{description}</p>
    </div>
  );
}

export default Dashboard;
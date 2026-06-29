import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function UserManagement() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'cashier' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await api.post('/auth/register', formData);
      setSuccess(`User "${formData.username}" created successfully as ${formData.role}`);
      setFormData({ username: '', email: '', password: '', role: 'cashier' });
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors && errors.length > 0) {
        setError(errors.map((e) => e.msg).join(', '));
      } else {
        setError(err.response?.data?.message || 'Failed to create user');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container narrow">
      <button onClick={() => navigate('/dashboard')} className="back-btn">← Back to Dashboard</button>

      <h1>👥 User Management</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.2rem' }}>Create new staff accounts (admin or cashier).</p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="form-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <input
          type="text" placeholder="Username" required
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        />
        <input
          type="email" placeholder="Email" required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="password" placeholder="Password (min 6 characters)" required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        >
          <option value="cashier">Cashier</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: '0.7rem' }}>
          {submitting ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  );
}

export default UserManagement;
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
    <div style={{ padding: '2rem', fontFamily: 'Arial', maxWidth: '500px', margin: '0 auto' }}>
      <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '1rem', cursor: 'pointer' }}>
        ← Back to Dashboard
      </button>

      <h1>User Management</h1>
      <p style={{ color: '#777' }}>Create new staff accounts (admin or cashier).</p>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <input
          type="text" placeholder="Username" required
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          style={{ padding: '0.6rem' }}
        />
        <input
          type="email" placeholder="Email" required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          style={{ padding: '0.6rem' }}
        />
        <input
          type="password" placeholder="Password (min 6 characters)" required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          style={{ padding: '0.6rem' }}
        />
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          style={{ padding: '0.6rem' }}
        >
          <option value="cashier">Cashier</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          disabled={submitting}
          style={{ padding: '0.7rem', background: '#2E6DA4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {submitting ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  );
}

export default UserManagement;
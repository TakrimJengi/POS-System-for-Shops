import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { isAdmin } from '../services/auth';

function Categories() {
  const navigate = useNavigate();
  const admin = isAdmin();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  // Fetch categories when page loads
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await api.post('/categories', { category_name: newCategoryName });
      setNewCategoryName('');
      fetchCategories(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add category');
    }
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/categories/${id}`, { category_name: editingName });
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial', maxWidth: '700px', margin: '0 auto' }}>
      <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '1rem', cursor: 'pointer' }}>
        ← Back to Dashboard
      </button>

      <h1>Categories</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {admin && (
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="New category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            style={{ flex: 1, padding: '0.5rem' }}
          />
          <button type="submit" style={{ padding: '0.5rem 1rem', background: '#2E6DA4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Add
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem' }}>ID</th>
              <th style={{ padding: '0.5rem' }}>Category Name</th>
              {admin && <th style={{ padding: '0.5rem' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>{cat.id}</td>
                <td style={{ padding: '0.5rem' }}>
                  {editingId === cat.id ? (
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      style={{ padding: '0.3rem' }}
                    />
                  ) : (
                    cat.category_name
                  )}
                </td>
                {admin && (
                  <td style={{ padding: '0.5rem' }}>
                    {editingId === cat.id ? (
                      <>
                        <button onClick={() => handleUpdate(cat.id)} style={{ marginRight: '0.5rem' }}>Save</button>
                        <button onClick={() => setEditingId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setEditingId(cat.id); setEditingName(cat.category_name); }}
                          style={{ marginRight: '0.5rem' }}
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDelete(cat.id)} style={{ color: 'red' }}>Delete</button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Categories;
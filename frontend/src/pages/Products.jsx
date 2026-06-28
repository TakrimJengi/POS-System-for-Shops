import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { isAdmin } from '../services/auth';

function Products() {
  const navigate = useNavigate();
  const admin = isAdmin();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '', product_name: '', purchase_price: '', selling_price: '', stock_quantity: '', minimum_stock: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async (searchTerm = '') => {
    try {
      setLoading(true);
      const url = searchTerm ? `/products?search=${searchTerm}` : '/products';
      const res = await api.get(url);
      setProducts(res.data);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(search);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', formData);
      setFormData({ category_id: '', product_name: '', purchase_price: '', selling_price: '', stock_quantity: '', minimum_stock: '' });
      setShowAddForm(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Failed to add product');
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditData({
      category_id: product.category_id,
      product_name: product.product_name,
      purchase_price: product.purchase_price,
      selling_price: product.selling_price,
      minimum_stock: product.minimum_stock
    });
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/products/${id}`, editData);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial', maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '1rem', cursor: 'pointer' }}>
        ← Back to Dashboard
      </button>

      <h1>Products</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: '0.5rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>Search</button>
        {search && (
          <button type="button" onClick={() => { setSearch(''); fetchProducts(); }} style={{ padding: '0.5rem 1rem' }}>
            Clear
          </button>
        )}
      </form>

      {admin && (
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ padding: '0.5rem 1rem', background: '#2E6DA4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '1rem' }}
          >
            {showAddForm ? 'Cancel' : '+ Add Product'}
          </button>

          {showAddForm && (
            <form onSubmit={handleAdd} style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                required
                style={{ padding: '0.5rem' }}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                ))}
              </select>

              <input
                type="text" placeholder="Product Name" required
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                style={{ padding: '0.5rem' }}
              />
              <input
                type="number" placeholder="Purchase Price" required
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                style={{ padding: '0.5rem' }}
              />
              <input
                type="number" placeholder="Selling Price" required
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                style={{ padding: '0.5rem' }}
              />
              <input
                type="number" placeholder="Stock Quantity"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                style={{ padding: '0.5rem' }}
              />
              <input
                type="number" placeholder="Minimum Stock"
                value={formData.minimum_stock}
                onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
                style={{ padding: '0.5rem' }}
              />
              <button type="submit" style={{ gridColumn: 'span 2', padding: '0.5rem', background: '#2E6DA4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Save Product
              </button>
            </form>
          )}
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem' }}>Name</th>
              <th style={{ padding: '0.5rem' }}>Category</th>
              <th style={{ padding: '0.5rem' }}>Purchase</th>
              <th style={{ padding: '0.5rem' }}>Selling</th>
              <th style={{ padding: '0.5rem' }}>Stock</th>
              {admin && <th style={{ padding: '0.5rem' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                {editingId === p.id ? (
                  <>
                    <td style={{ padding: '0.5rem' }}>
                      <input value={editData.product_name} onChange={(e) => setEditData({ ...editData, product_name: e.target.value })} style={{ width: '100%' }} />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <select value={editData.category_id} onChange={(e) => setEditData({ ...editData, category_id: e.target.value })}>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input type="number" value={editData.purchase_price} onChange={(e) => setEditData({ ...editData, purchase_price: e.target.value })} style={{ width: '70px' }} />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input type="number" value={editData.selling_price} onChange={(e) => setEditData({ ...editData, selling_price: e.target.value })} style={{ width: '70px' }} />
                    </td>
                    <td style={{ padding: '0.5rem' }}>{p.stock_quantity}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <button onClick={() => handleUpdate(p.id)} style={{ marginRight: '0.5rem' }}>Save</button>
                      <button onClick={() => setEditingId(null)}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: '0.5rem' }}>{p.product_name}</td>
                    <td style={{ padding: '0.5rem' }}>{p.Category?.category_name}</td>
                    <td style={{ padding: '0.5rem' }}>{p.purchase_price}</td>
                    <td style={{ padding: '0.5rem' }}>{p.selling_price}</td>
                    <td style={{ padding: '0.5rem' }}>{p.stock_quantity}</td>
                    {admin && (
                      <td style={{ padding: '0.5rem' }}>
                        <button onClick={() => startEdit(p)} style={{ marginRight: '0.5rem' }}>Edit</button>
                        <button onClick={() => handleDelete(p.id)} style={{ color: 'red' }}>Delete</button>
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Products;
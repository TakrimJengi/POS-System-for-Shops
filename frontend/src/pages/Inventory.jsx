import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { isAdmin } from '../services/auth';

function Inventory() {
  const navigate = useNavigate();
  const admin = isAdmin();

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showStockIn, setShowStockIn] = useState(null); // product id
  const [stockQty, setStockQty] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inventory');
      setInventory(res.data.inventory);
    } catch (err) {
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleStockIn = async (productId) => {
    if (!stockQty || stockQty <= 0) {
      setError('Enter a valid quantity');
      return;
    }

    try {
      const res = await api.post('/inventory/stock-in', { product_id: productId, quantity: stockQty });
      setSuccess(`Added ${res.data.added_quantity} units to ${res.data.product_name}. New total: ${res.data.new_quantity}`);
      setError('');
      setStockQty('');
      setShowStockIn(null);
      fetchInventory();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add stock');
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial', maxWidth: '900px', margin: '0 auto' }}>
      <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '1rem', cursor: 'pointer' }}>
        ← Back to Dashboard
      </button>

      <h1>Inventory</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem' }}>Product</th>
              <th style={{ padding: '0.5rem' }}>Category</th>
              <th style={{ padding: '0.5rem' }}>Stock</th>
              <th style={{ padding: '0.5rem' }}>Min Stock</th>
              <th style={{ padding: '0.5rem' }}>Status</th>
              {admin && <th style={{ padding: '0.5rem' }}>Action</th>}
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => {
              const low = item.stock_quantity <= item.minimum_stock;
              return (
                <tr key={item.id} style={{ borderBottom: '1px solid #eee', background: low ? '#fff3f3' : 'transparent' }}>
                  <td style={{ padding: '0.5rem' }}>{item.product_name}</td>
                  <td style={{ padding: '0.5rem' }}>{item.category_name}</td>
                  <td style={{ padding: '0.5rem' }}>{item.stock_quantity}</td>
                  <td style={{ padding: '0.5rem' }}>{item.minimum_stock}</td>
                  <td style={{ padding: '0.5rem', color: low ? 'red' : 'green' }}>
                    {low ? 'Low Stock' : 'OK'}
                  </td>
                  {admin && (
                    <td style={{ padding: '0.5rem' }}>
                      {showStockIn === item.id ? (
                        <span style={{ display: 'flex', gap: '0.3rem' }}>
                          <input
                            type="number"
                            placeholder="Qty"
                            value={stockQty}
                            onChange={(e) => setStockQty(e.target.value)}
                            style={{ width: '60px', padding: '0.3rem' }}
                          />
                          <button onClick={() => handleStockIn(item.id)}>Add</button>
                          <button onClick={() => { setShowStockIn(null); setStockQty(''); }}>Cancel</button>
                        </span>
                      ) : (
                        <button onClick={() => setShowStockIn(item.id)}>Stock In</button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Inventory;
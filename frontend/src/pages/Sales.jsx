import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Sales() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find((item) => item.product_id === product.id);
    if (existing) {
      setCart(cart.map((item) =>
        item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        product_name: product.product_name,
        selling_price: parseFloat(product.selling_price),
        quantity: 1
      }]);
    }
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map((item) =>
      item.product_id === productId ? { ...item, quantity: newQty } : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const items = cart.map((item) => ({ product_id: item.product_id, quantity: item.quantity }));
      const res = await api.post('/sales', { items });
      setSuccess(`✅ Sale completed! Invoice: ${res.data.invoice_no} | Total: $${res.data.total_amount}`);
      setCart([]);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete sale');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <button onClick={() => navigate('/dashboard')} className="back-btn">← Back to Dashboard</button>

      <h1>🛒 New Sale</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="pos-layout">
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Products</h3>
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.9rem' }}>
              {products.map((p) => (
                <div
                key={p.id}
                onClick={() => p.stock_quantity > 0 && addToCart(p)}
                className={`product-tile ${p.stock_quantity <= 0 ? 'disabled' : ''}`}
              >
                {p.image_url ? (
                  <img src={`http://localhost:5000${p.image_url}`} alt={p.product_name} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.5rem' }} />
                ) : (
                  <div style={{ width: '100%', height: '80px', borderRadius: '8px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
                )}
                <strong>{p.product_name}</strong>
                  <p style={{ margin: '0.4rem 0', color: 'var(--primary-dark)', fontWeight: 700, fontSize: '1.1rem' }}>${p.selling_price}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: p.stock_quantity > 0 ? 'var(--text-muted)' : 'var(--danger)' }}>
                    Stock: {p.stock_quantity}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cart-panel">
          <h3 style={{ marginBottom: '1rem' }}>🧾 Cart</h3>
          {cart.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Cart is empty. Click a product to add it.</p>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.product_id} className="cart-item">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{item.product_name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>${item.selling_price} each</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="qty-btn">−</button>
                    <span style={{ minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="qty-btn">+</button>
                    <button onClick={() => removeFromCart(item.product_id)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '0.3rem', fontSize: '1rem' }}>✕</button>
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '1.2rem 0' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Total</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-dark)' }}>${cartTotal.toFixed(2)}</span>
              </div>

              <button onClick={handleCheckout} disabled={submitting} className="btn btn-success" style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}>
                {submitting ? 'Processing...' : 'Complete Sale'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sales;
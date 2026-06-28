import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Sales() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]); // [{ product_id, product_name, selling_price, quantity }]
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

      setSuccess(`Sale completed! Invoice: ${res.data.invoice_no} | Total: ${res.data.total_amount}`);
      setCart([]);
      fetchProducts(); // refresh stock numbers
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete sale');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '1rem', cursor: 'pointer' }}>
        ← Back to Dashboard
      </button>

      <h1>New Sale</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>

        {/* Product List */}
        <div>
          <h3>Products</h3>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.8rem' }}>
              {products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => p.stock_quantity > 0 && addToCart(p)}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '1rem',
                    cursor: p.stock_quantity > 0 ? 'pointer' : 'not-allowed',
                    opacity: p.stock_quantity > 0 ? 1 : 0.5,
                    background: 'white'
                  }}
                >
                  <strong>{p.product_name}</strong>
                  <p style={{ margin: '0.3rem 0', color: '#555' }}>${p.selling_price}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: p.stock_quantity > 0 ? '#777' : 'red' }}>
                    Stock: {p.stock_quantity}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart */}
        <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '1.5rem', alignSelf: 'start' }}>
          <h3>Cart</h3>
          {cart.length === 0 ? (
            <p style={{ color: '#888' }}>Cart is empty. Click a product to add it.</p>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                  <div>
                    <div>{item.product_name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#777' }}>${item.selling_price} each</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>+</button>
                    <button onClick={() => removeFromCart(item.product_id)} style={{ color: 'red', marginLeft: '0.5rem' }}>✕</button>
                  </div>
                </div>
              ))}

              <h3 style={{ textAlign: 'right' }}>Total: ${cartTotal.toFixed(2)}</h3>

              <button
                onClick={handleCheckout}
                disabled={submitting}
                style={{ width: '100%', padding: '0.8rem', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}
              >
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
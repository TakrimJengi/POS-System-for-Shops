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
  const [invoiceModal, setInvoiceModal] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [salesHistory, setSalesHistory] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

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

  const fetchSalesHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await api.get('/sales');
      setSalesHistory(res.data);
    } catch (err) {
      setError('Failed to load sales history');
    } finally {
      setHistoryLoading(false);
    }
  };
  
  const fetchInvoiceDetail = async (id) => {
    try {
      const res = await api.get(`/sales/${id}`);
      setSelectedInvoice(res.data);
    } catch (err) {
      setError('Failed to load invoice');
    }
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
      setInvoiceModal({
        invoice_no: res.data.invoice_no,
        total_amount: res.data.total_amount,
        items: cart
      });
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

      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setShowHistory(false)}
          className={`btn btn-sm ${!showHistory ? 'btn-primary' : 'btn-secondary'}`}>
          🛒 New Sale
        </button>
        <button
          onClick={() => { setShowHistory(true); fetchSalesHistory(); }}
          className={`btn btn-sm ${showHistory ? 'btn-primary' : 'btn-secondary'}`}>
          📋 Sales History
        </button>
      </div>

      {/* Invoice Modal */}
      {invoiceModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '2rem', minWidth: '380px', maxWidth: '500px', width: '90%' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '0.3rem' }}>✅ Sale Complete</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{invoiceModal.invoice_no}</p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceModal.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>${item.selling_price}</td>
                      <td>${(item.selling_price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.2rem', fontWeight: 700, fontSize: '1.1rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--success)' }}>${invoiceModal.total_amount}</span>
            </div>
            <button onClick={() => setInvoiceModal(null)} className="btn btn-primary" style={{ width: '100%', marginTop: '1.2rem' }}>
              Close
            </button>
          </div>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showHistory ? (
        <div>
          {historyLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Invoice No</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {salesHistory.map((sale) => (
                    <tr key={sale.id}>
                      <td><strong>{sale.invoice_no}</strong></td>
                      <td>{sale.sale_date}</td>
                      <td>${sale.total_amount}</td>
                      <td>
                        <button
                          onClick={() => fetchInvoiceDetail(sale.id)}
                          className="btn btn-primary btn-sm">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Selected Invoice Detail Modal */}
          {selectedInvoice && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '2rem', minWidth: '380px', maxWidth: '500px', width: '90%' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '0.3rem' }}>🧾 Invoice</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{selectedInvoice.invoice_no}</p>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.SaleDetails.map((detail, idx) => (
                        <tr key={idx}>
                          <td>{detail.Product.product_name}</td>
                          <td>{detail.quantity}</td>
                          <td>${detail.unit_price}</td>
                          <td>${(detail.unit_price * detail.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.2rem', fontWeight: 700, fontSize: '1.1rem' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--success)' }}>${selectedInvoice.total_amount}</span>
                </div>
                <button onClick={() => setSelectedInvoice(null)} className="btn btn-primary" style={{ width: '100%', marginTop: '1.2rem' }}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
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
      )}
    </div>
  );
}

export default Sales;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Accounting() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [categoryReport, setCategoryReport] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', expense_date: '' });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [summaryRes, categoryRes, expensesRes] = await Promise.all([
        api.get('/accounting/summary'),
        api.get('/accounting/category-sales'),
        api.get('/expenses')
      ]);
      setSummary(summaryRes.data);
      setCategoryReport(categoryRes.data.category_report);
      setExpenses(expensesRes.data);
    } catch (err) {
      setError('Failed to load accounting data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post('/expenses', expenseForm);
      setExpenseForm({ description: '', amount: '', expense_date: '' });
      setShowExpenseForm(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchAll();
    } catch (err) {
      setError('Failed to delete expense');
    }
  };

  if (loading) return <div className="page-container"><p style={{ color: 'var(--text-muted)' }}>Loading...</p></div>;

  return (
    <div className="page-container">
      <button onClick={() => navigate('/dashboard')} className="back-btn">← Back to Dashboard</button>

      <h1>💰 Accounting</h1>
      {error && <div className="alert alert-error">{error}</div>}

      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div className="summary-card">
            <p className="label">Total Income</p>
            <h2 className="value" style={{ color: 'var(--success)' }}>${summary.total_income}</h2>
          </div>
          <div className="summary-card">
            <p className="label">Total Expenses</p>
            <h2 className="value" style={{ color: 'var(--danger)' }}>${summary.total_expenses}</h2>
          </div>
          <div className="summary-card">
            <p className="label">Profit</p>
            <h2 className="value" style={{ color: summary.profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>${summary.profit}</h2>
          </div>
        </div>
      )}

      <h3 style={{ marginBottom: '0.8rem' }}>Category-wise Sales</h3>
      <div className="table-wrap" style={{ marginBottom: '2rem' }}>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Quantity Sold</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {categoryReport.map((cat, idx) => (
              <tr key={idx}>
                <td><strong>{cat.category_name}</strong></td>
                <td>{cat.total_quantity_sold}</td>
                <td>${cat.total_revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
        <h3>Expenses</h3>
        <button onClick={() => setShowExpenseForm(!showExpenseForm)} className="btn btn-primary btn-sm">
          {showExpenseForm ? 'Cancel' : '+ Add Expense'}
        </button>
      </div>

      {showExpenseForm && (
        <form onSubmit={handleAddExpense} className="form-card" style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
          <input
            type="text" placeholder="Description" required
            value={expenseForm.description}
            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
            style={{ flex: 2, minWidth: '180px' }}
          />
          <input
            type="number" placeholder="Amount" required
            value={expenseForm.amount}
            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
            style={{ flex: 1, minWidth: '100px' }}
          />
          <input
            type="date"
            value={expenseForm.expense_date}
            onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })}
            style={{ flex: 1, minWidth: '140px' }}
          />
          <button type="submit" className="btn btn-success">Save</button>
        </form>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp.id}>
                <td>{exp.description}</td>
                <td>${exp.amount}</td>
                <td>{exp.expense_date}</td>
                <td><button onClick={() => handleDeleteExpense(exp.id)} className="btn btn-danger btn-sm">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Accounting;
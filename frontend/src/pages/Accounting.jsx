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

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial', maxWidth: '900px', margin: '0 auto' }}>
      <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '1rem', cursor: 'pointer' }}>
        ← Back to Dashboard
      </button>

      <h1>Accounting</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Financial Summary Cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <SummaryCard label="Total Income" value={summary.total_income} color="#27ae60" />
          <SummaryCard label="Total Expenses" value={summary.total_expenses} color="#c0392b" />
          <SummaryCard label="Profit" value={summary.profit} color={summary.profit >= 0 ? '#27ae60' : '#c0392b'} />
        </div>
      )}

      {/* Category-wise Sales */}
      <h2>Category-wise Sales</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
            <th style={{ padding: '0.5rem' }}>Category</th>
            <th style={{ padding: '0.5rem' }}>Quantity Sold</th>
            <th style={{ padding: '0.5rem' }}>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {categoryReport.map((cat, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.5rem' }}>{cat.category_name}</td>
              <td style={{ padding: '0.5rem' }}>{cat.total_quantity_sold}</td>
              <td style={{ padding: '0.5rem' }}>${cat.total_revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Expenses */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Expenses</h2>
        <button
          onClick={() => setShowExpenseForm(!showExpenseForm)}
          style={{ padding: '0.5rem 1rem', background: '#2E6DA4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {showExpenseForm ? 'Cancel' : '+ Add Expense'}
        </button>
      </div>

      {showExpenseForm && (
        <form onSubmit={handleAddExpense} style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '0.5rem', marginTop: '1rem', marginBottom: '1rem' }}>
          <input
            type="text" placeholder="Description" required
            value={expenseForm.description}
            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
            style={{ flex: 2, padding: '0.5rem' }}
          />
          <input
            type="number" placeholder="Amount" required
            value={expenseForm.amount}
            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
            style={{ flex: 1, padding: '0.5rem' }}
          />
          <input
            type="date"
            value={expenseForm.expense_date}
            onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })}
            style={{ flex: 1, padding: '0.5rem' }}
          />
          <button type="submit" style={{ padding: '0.5rem 1rem', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Save
          </button>
        </form>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
            <th style={{ padding: '0.5rem' }}>Description</th>
            <th style={{ padding: '0.5rem' }}>Amount</th>
            <th style={{ padding: '0.5rem' }}>Date</th>
            <th style={{ padding: '0.5rem' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.5rem' }}>{exp.description}</td>
              <td style={{ padding: '0.5rem' }}>${exp.amount}</td>
              <td style={{ padding: '0.5rem' }}>{exp.expense_date}</td>
              <td style={{ padding: '0.5rem' }}>
                <button onClick={() => handleDeleteExpense(exp.id)} style={{ color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div style={{ background: 'white', border: `2px solid ${color}`, borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
      <p style={{ margin: 0, color: '#777', fontSize: '0.9rem' }}>{label}</p>
      <h2 style={{ margin: '0.3rem 0 0 0', color }}>${value}</h2>
    </div>
  );
}

export default Accounting;
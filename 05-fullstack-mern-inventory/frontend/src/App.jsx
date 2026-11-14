import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    quantity: '',
    price: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/items`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setItems(json.data);
      setError('');
    } catch (err) {
      setError(`Backend connection failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          price: Number(form.price)
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      setForm({ name: '', sku: '', category: 'Electronics', quantity: '', price: '' });
      fetchItems();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE}/items/${id}`, { method: 'DELETE' });
      fetchItems();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '920px', margin: '30px auto', fontFamily: 'Segoe UI, sans-serif', padding: '0 16px' }}>
      <h1>Full-Stack MERN Inventory System</h1>
      <p style={{ color: '#475569' }}>
        Connected to Express + MongoDB API: <code>{API_BASE}</code>
      </p>

      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '24px' }}
      >
        <input
          placeholder="Item Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="SKU (e.g. RPI-05)"
          value={form.sku}
          onChange={(e) => setForm({ ...form, sku: e.target.value })}
          required
        />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option value="Electronics">Electronics</option>
          <option value="Mechanical">Mechanical</option>
          <option value="Lab Consumables">Lab Consumables</option>
          <option value="Networking">Networking</option>
        </select>
        <input
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Price (₹)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />
        <button
          type="submit"
          style={{
            gridColumn: 'span 5',
            padding: '10px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Add Record to MongoDB
        </button>
      </form>

      {loading ? (
        <p>Loading records from MongoDB...</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f1f5f9' }}>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Price (₹)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>
                  No items in MongoDB yet. Add your first item above!
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id}>
                  <td><strong>{item.sku}</strong></td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.price}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(item._id)}
                      style={{
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
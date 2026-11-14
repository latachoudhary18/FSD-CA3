import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AddItemForm({ onAddItem }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Hardware');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || Number(quantity) <= 0 || Number(price) <= 0) {
      setError('Please provide a valid item name, positive quantity, and positive price.');
      return;
    }

    onAddItem({
      id: Date.now(),
      name: name.trim(),
      category,
      quantity: Number(quantity),
      price: Number(price)
    });

    navigate('/');
  };

  return (
    <div className="page-container">
      <div className="form-card">
        <h2>Add Inventory Record</h2>
        {error && <p style={{ color: '#dc2626', fontWeight: 'bold' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Item Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., NVIDIA Jetson Nano"
            />
          </div>

          <div className="form-field">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          <div className="form-field">
            <label>Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g., 3"
            />
          </div>

          <div className="form-field">
            <label>Price (₹)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g., 14500"
            />
          </div>

          <button type="submit">Save to Inventory</button>
        </form>
      </div>
    </div>
  );
}

export default AddItemForm;
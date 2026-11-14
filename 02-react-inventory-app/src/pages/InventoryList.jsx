import { useState } from 'react';
import InventoryItemCard from '../components/InventoryItemCard';

function InventoryList({ items, onDeleteItem }) {
  const [filterCategory, setFilterCategory] = useState('ALL');

  const visibleItems =
    filterCategory === 'ALL'
      ? items
      : items.filter((item) => item.category === filterCategory);

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Warehouse Stock Overview</h2>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="ALL">All Categories</option>
          <option value="Hardware">Hardware</option>
          <option value="Software">Software</option>
          <option value="Accessories">Accessories</option>
        </select>
      </div>

      {/* Conditional Rendering if empty */}
      {visibleItems.length === 0 ? (
        <p style={{ marginTop: '20px', color: '#64748b' }}>
          No inventory items available in this category. Click "Add New Item" to create one.
        </p>
      ) : (
        <div className="grid">
          {visibleItems.map((item) => (
            <InventoryItemCard key={item.id} item={item} onDelete={onDeleteItem} />
          ))}
        </div>
      )}
    </div>
  );
}

export default InventoryList;
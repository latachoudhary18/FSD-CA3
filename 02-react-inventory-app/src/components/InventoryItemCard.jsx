function InventoryItemCard({ item, onDelete }) {
  const isLowStock = item.quantity < 5;

  return (
    <div className={`item-card ${isLowStock ? 'low-stock' : ''}`}>
      <h3>{item.name}</h3>
      <span className="badge">{item.category}</span>
      {/* Conditional Rendering for Low Stock Alert */}
      {isLowStock && <span className="badge warning">Low Stock!</span>}

      <p><strong>Quantity:</strong> {item.quantity} units</p>
      <p><strong>Price:</strong> ₹{item.price}</p>
      <p><strong>Total Value:</strong> ₹{item.quantity * item.price}</p>

      <button className="delete-btn" onClick={() => onDelete(item.id)}>
        Remove Item
      </button>
    </div>
  );
}

export default InventoryItemCard;
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import InventoryList from './pages/InventoryList';
import AddItemForm from './pages/AddItemForm';

const INITIAL_DATA = [
  { id: 101, name: 'Raspberry Pi 5 (8GB)', category: 'Hardware', quantity: 12, price: 7800 },
  { id: 102, name: 'USB-C Logic Analyzer', category: 'Accessories', quantity: 3, price: 1200 },
  { id: 103, name: 'MATLAB Student License', category: 'Software', quantity: 25, price: 2500 }
];

function App() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('ca3_react_inventory');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  // Sync inventory changes to localStorage whenever state updates
  useEffect(() => {
    localStorage.setItem('ca3_react_inventory', JSON.stringify(items));
  }, [items]);

  const addItem = (newItem) => {
    setItems((prev) => [newItem, ...prev]);
  };

  const deleteItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <BrowserRouter>
      <Navbar totalItems={items.length} />
      <Routes>
        <Route path="/" element={<InventoryList items={items} onDeleteItem={deleteItem} />} />
        <Route path="/add" element={<AddItemForm onAddItem={addItem} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
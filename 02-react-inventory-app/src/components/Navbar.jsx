import { NavLink } from 'react-router-dom';

function Navbar({ totalItems }) {
  return (
    <nav className="navbar">
      <h2>React Inventory ({totalItems})</h2>
      <div className="nav-links">
        <NavLink to="/">Inventory List</NavLink>
        <NavLink to="/add">Add New Item</NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
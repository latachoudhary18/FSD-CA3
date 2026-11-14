require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const requestLogger = require('./middleware/logger');
const validateInventoryInput = require('./middleware/validator');
const protectRoute = require('./middleware/authMiddleware');
const centralizedErrorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 4000;

// Built-in JSON parser & Custom Request Logger Middleware
app.use(express.json());
app.use(requestLogger);

// In-memory Users & Inventory Store
const users = [];
let inventory = [
  { id: 1, name: 'Oscilloscope Digital', category: 'Lab Equipment', quantity: 4, price: 24000 },
  { id: 2, name: 'Soldering Station', category: 'Tools', quantity: 9, price: 3200 }
];

// ================= AUTH ROUTES =================
// Register User (Hashes password with bcrypt)
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password || password.length < 6) {
      const err = new Error('Username and password (min 6 chars) are required.');
      err.statusCode = 400;
      return next(err);
    }

    const exists = users.find((u) => u.username === username);
    if (exists) {
      const err = new Error('Username already registered.');
      err.statusCode = 409;
      return next(err);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = { id: users.length + 1, username, password: hashedPassword };
    users.push(newUser);

    res.status(201).json({
      success: true,
      message: 'User registered securely with bcrypt hash.',
      user: { id: newUser.id, username: newUser.username }
    });
  } catch (error) {
    next(error);
  }
});

// Login User (Verifies bcrypt hash & signs JWT)
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = users.find((u) => u.username === username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      const err = new Error('Invalid username or password.');
      err.statusCode = 401;
      return next(err);
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ success: true, token });
  } catch (error) {
    next(error);
  }
});

// ================= INVENTORY CRUD ROUTES =================
// Public GET all items
app.get('/api/inventory', (req, res) => {
  res.json({ success: true, count: inventory.length, data: inventory });
});

// Protected POST (Requires valid JWT + Input Validation)
app.post('/api/inventory', protectRoute, validateInventoryInput, (req, res) => {
  const newItem = {
    id: inventory.length ? inventory[inventory.length - 1].id + 1 : 1,
    name: req.body.name.trim(),
    category: req.body.category.trim(),
    quantity: req.body.quantity,
    price: req.body.price,
    addedBy: req.user.username
  };
  inventory.push(newItem);
  res.status(201).json({ success: true, data: newItem });
});

// Protected PUT (Update existing item)
app.put('/api/inventory/:id', protectRoute, validateInventoryInput, (req, res, next) => {
  const id = Number(req.params.id);
  const index = inventory.findIndex((item) => item.id === id);

  if (index === -1) {
    const err = new Error(`Inventory item with ID ${id} not found.`);
    err.statusCode = 404;
    return next(err);
  }

  inventory[index] = {
    ...inventory[index],
    name: req.body.name.trim(),
    category: req.body.category.trim(),
    quantity: req.body.quantity,
    price: req.body.price
  };

  res.json({ success: true, data: inventory[index] });
});

// Protected DELETE (Remove item)
app.delete('/api/inventory/:id', protectRoute, (req, res, next) => {
  const id = Number(req.params.id);
  const index = inventory.findIndex((item) => item.id === id);

  if (index === -1) {
    const err = new Error(`Inventory item with ID ${id} not found.`);
    err.statusCode = 404;
    return next(err);
  }

  const [deleted] = inventory.splice(index, 1);
  res.json({ success: true, message: 'Item deleted', data: deleted });
});

// Centralized Error Handler (Must be registered last)
app.use(centralizedErrorHandler);

app.listen(PORT, () => {
  console.log(`Express JWT API running on http://localhost:${PORT}`);
});
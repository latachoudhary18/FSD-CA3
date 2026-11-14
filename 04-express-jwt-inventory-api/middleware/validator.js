const validateInventoryInput = (req, res, next) => {
  const { name, category, quantity, price } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    const err = new Error('Item name is required and must be at least 2 characters.');
    err.statusCode = 400;
    return next(err);
  }
  if (!category || typeof category !== 'string') {
    const err = new Error('Category is required.');
    err.statusCode = 400;
    return next(err);
  }
  if (typeof quantity !== 'number' || quantity < 0) {
    const err = new Error('Quantity must be a non-negative number.');
    err.statusCode = 400;
    return next(err);
  }
  if (typeof price !== 'number' || price <= 0) {
    const err = new Error('Price must be a number greater than 0.');
    err.statusCode = 400;
    return next(err);
  }

  next();
};

module.exports = validateInventoryInput;
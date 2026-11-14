const jwt = require('jsonwebtoken');

const protectRoute = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Access denied. Missing or malformed Bearer token.');
    err.statusCode = 401;
    return next(err);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    const err = new Error('Invalid or expired JWT token.');
    err.statusCode = 403;
    next(err);
  }
};

module.exports = protectRoute;
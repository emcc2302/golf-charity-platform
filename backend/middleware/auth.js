const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorised — no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('selectedCharity', 'name logo slug');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account has been deactivated' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired — please log in again' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token — please log in again' });
  }
};

// Admin only
exports.admin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ success: false, message: 'Admin access required' });
};

// Active subscription required
exports.requireSubscription = (req, res, next) => {
  const sub = req.user?.subscription;
  const isActive = sub?.status === 'active' &&
    sub?.currentPeriodEnd &&
    new Date(sub.currentPeriodEnd) > new Date();

  if (isActive) return next();

  res.status(403).json({
    success: false,
    message: 'Active subscription required to access this feature',
    code: 'SUBSCRIPTION_REQUIRED'
  });
};

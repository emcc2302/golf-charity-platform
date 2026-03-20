const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

// Stripe webhook MUST come before express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads
app.use('/uploads', express.static('uploads'));

// ── Routes ──────────────────────────────────────────────
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/users',    require('./routes/userRoutes'));
app.use('/api/scores',   require('./routes/scoreRoutes'));
app.use('/api/charities',require('./routes/charityRoutes'));
app.use('/api/draws',    require('./routes/drawRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/admin',    require('./routes/adminRoutes'));
app.use('/api/winners',  require('./routes/winnerRoutes'));

// Health check — visit localhost:5000/api/health to confirm server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date(), env: process.env.NODE_ENV });
});

// Root route — friendly message instead of "Cannot GET /"
app.get('/', (req, res) => {
  res.json({ message: '⛳ Golf Charity API is running', docs: '/api/health' });
});

// 404 for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;

const dotenv = require('dotenv');
dotenv.config(); // must be first

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const connectDB = require('./config/db');

const app = express();

// ─── CORS ─────────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      'http://localhost:5173',
      'https://marketnest-chi.vercel.app',
      'https://marketnest-pravin.vercel.app',
    ];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ─── Middleware ───────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ─── Health check ─────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: 'MarketNest API running' }));

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ─── Start ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
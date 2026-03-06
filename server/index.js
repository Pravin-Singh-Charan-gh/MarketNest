const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const connectDB = require('./config/db');

// dotenv.config();

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL,  // only allow our React app
  credentials: true                // allow cookies to be sent
}));
app.use(express.json());           // parse JSON request bodies
app.use(cookieParser());           // parse cookies (for refresh token)

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ─── Health check ────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: 'MarketNest API running' }));

// ─── Start ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
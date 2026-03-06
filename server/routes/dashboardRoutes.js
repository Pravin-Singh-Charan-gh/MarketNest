const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, requireRole('brand'), getDashboardStats);

module.exports = router;
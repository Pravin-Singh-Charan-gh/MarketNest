const Product = require('../models/Product');

exports.getDashboardStats = async (req, res) => {
  try {
    // Run all 3 counts in parallel for performance
    const [total, published, archived] = await Promise.all([
      Product.countDocuments({ owner: req.user.id, isDeleted: false }),
      Product.countDocuments({ owner: req.user.id, status: 'published', isDeleted: false }),
      Product.countDocuments({ owner: req.user.id, status: 'archived', isDeleted: false }),
    ]);

    res.json({ total, published, archived });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load dashboard', error: err.message });
  }
};
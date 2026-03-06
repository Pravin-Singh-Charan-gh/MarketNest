const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const { upload } = require('../config/cloudinary');

// Brand sees their own products — MUST be before /:id route
router.get('/brand/my-products', authMiddleware, requireRole('brand'), getMyProducts);

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Brand only routes
router.post('/', authMiddleware, requireRole('brand'), upload.array('images', 5), createProduct);
router.put('/:id', authMiddleware, requireRole('brand'), upload.array('images', 5), updateProduct);
router.delete('/:id', authMiddleware, requireRole('brand'), deleteProduct);

module.exports = router;
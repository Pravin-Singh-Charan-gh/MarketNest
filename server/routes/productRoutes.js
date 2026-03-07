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

const cpUpload = upload.fields([{ name: 'images', maxCount: 10 }]);

router.get('/brand/my-products', authMiddleware, requireRole('brand'), getMyProducts);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authMiddleware, requireRole('brand'), cpUpload, createProduct);
router.put('/:id', authMiddleware, requireRole('brand'), cpUpload, updateProduct);
router.delete('/:id', authMiddleware, requireRole('brand'), deleteProduct);

module.exports = router;
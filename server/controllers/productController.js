const streamifier = require('streamifier');

// Helper: upload a buffer to Cloudinary using a stream
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'marketnest', transformation: [{ width: 800, quality: 'auto' }] },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

// ── CREATE PRODUCT ─────────────────────────────────────────────
exports.createProduct = async (req, res) => {
  try {
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    const { title, description, price, category, status } = req.body || {};

    if (!title || !description || !price || !category) {
      return res.status(400).json({ message: 'Please provide title, description, price and category' });
    }

    // Upload each file buffer to Cloudinary
    const imageFiles = (req.files && req.files['images']) || [];
    const imageUrls = imageFiles.length > 0
       ? await Promise.all(imageFiles.map(file => uploadToCloudinary(file.buffer)))
       : [];

    const product = await Product.create({
      title,
      description,
      price,
      category,
      status: status || 'draft',
      images: imageUrls,
      owner: req.user.id
    });

    res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    console.log('Create product error:', err);
    res.status(500).json({ message: 'Failed to create product', error: err.message || JSON.stringify(err) });
  }
};

// ── GET ALL PRODUCTS (public — with search, filter, pagination) ─
exports.getProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 12 } = req.query;

    // Build query object dynamically
    const query = { isDeleted: false, status: 'published' };

    if (search) {
      query.title = { $regex: search, $options: 'i' }; // case-insensitive search
    }
    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;  // e.g. page 2 = skip first 12

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('owner', 'name')   // include brand name
        .sort({ createdAt: -1 })     // newest first
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query)  // total count for frontend pagination
    ]);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

// ── GET SINGLE PRODUCT ─────────────────────────────────────────
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isDeleted: false
    }).populate('owner', 'name email');

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product', error: err.message });
  }
};

// ── UPDATE PRODUCT ─────────────────────────────────────────────
exports.updateProduct = async (req, res) => {
  try {
    console.log('Update body:', req.body);
    console.log('Update files:', req.files);

    const product = await Product.findById(req.params.id);

    if (!product || product.isDeleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: you do not own this product' });
    }

    const { title, description, price, category, status } = req.body || {};

    // Handle new image uploads
    const imageFiles = (req.files && req.files['images']) || [];
    const newImageUrls = imageFiles.length > 0
      ? await Promise.all(imageFiles.map(file => uploadToCloudinary(file.buffer)))
      : [];

    // Keep existing images + add new ones
    const existingImages = Array.isArray(product.images) ? product.images : [];
    const images = [...existingImages, ...newImageUrls];

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        title: title || product.title,
        description: description || product.description,
        price: price || product.price,
        category: category || product.category,
        status: status || product.status,
        images 
      },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Product updated', product: updated });
  } catch (err) {
    console.log('Update product error FULL:', err);
    res.status(500).json({ message: 'Failed to update product', error: err.message });
  }
};

// ── SOFT DELETE PRODUCT ────────────────────────────────────────
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || product.isDeleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Ownership check
    if (product.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: you do not own this product' });
    }

    // Soft delete — just flip the flag
    product.isDeleted = true;
    product.status = 'archived';
    await product.save();

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product', error: err.message });
  }
};

// ── GET BRAND'S OWN PRODUCTS ───────────────────────────────────
exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      owner: req.user.id,
      isDeleted: false
    }).sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your products', error: err.message });
  }
};
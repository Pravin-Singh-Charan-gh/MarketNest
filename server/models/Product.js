const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['clothing', 'shoes', 'accessories', 'bags', 'jewelry', 'other']
  },
  images: {
    type: [String],   // array of Cloudinary URLs
    default: []
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isDeleted: {
    type: Boolean,
    default: false    // soft delete — never actually remove from DB
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true    // every product must belong to a brand
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
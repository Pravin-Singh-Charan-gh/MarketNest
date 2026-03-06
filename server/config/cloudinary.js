const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Store files in memory (as Buffer) — we'll upload manually to Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

module.exports = { cloudinary, upload };
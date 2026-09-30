const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const requiredConfig = ['CLOUD_NAME', 'CLOUD_API_KEY', 'CLOUD_API_SECRET'];
const missingConfig = requiredConfig.filter((key) => !process.env[key]);

if (!missingConfig.length) {
  cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.CLOUD_API_SECRET
  });
}

const storage = missingConfig.length
  ? multer.memoryStorage()
  : new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'wanderlust_dev',
        allowed_formats: ["png", "jpg", "jpeg"]
      },
    });

module.exports = {
    cloudinary,
    storage
};
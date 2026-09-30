const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const cloudName = process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUD_API_KEY || process.env.CLOUDINARY_KEY;
const apiSecret = process.env.CLOUD_API_SECRET || process.env.CLOUDINARY_SECRET;

const hasCloudinary = Boolean(cloudName && apiKey && apiSecret);

if (hasCloudinary) {
  cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
  });
}

const storage = !hasCloudinary
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
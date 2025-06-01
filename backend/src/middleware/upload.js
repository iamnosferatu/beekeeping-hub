// backend/src/middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { createFileFilter, MAX_FILE_SIZES } = require("./fileValidation");

// Ensure upload directories exist
const uploadDirs = {
  avatars: path.join(__dirname, "../../uploads/avatars"),
  articles: path.join(__dirname, "../../uploads/articles"),
};

// Create directories if they don't exist
Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirs.avatars);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: userId-timestamp.extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user.id}-${uniqueSuffix}${ext}`);
  }
});

// Configure storage for article images
const articleStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirs.articles);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `article-${uniqueSuffix}${ext}`);
  }
});

// Enhanced file filters using the validation module
const avatarFilter = createFileFilter('avatar');
const articleFilter = createFileFilter('article');

// Create multer instances with enhanced validation
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: MAX_FILE_SIZES.avatar,
    files: 1, // Only allow 1 file
    fields: 1, // Only allow 1 field
    fieldNameSize: 100, // Limit field name length
    fieldSize: 1024 * 1024 // Limit field value size to 1MB
  },
  fileFilter: avatarFilter
});

const uploadArticleImage = multer({
  storage: articleStorage,
  limits: {
    fileSize: MAX_FILE_SIZES.article,
    files: 1, // Only allow 1 file
    fields: 1, // Only allow 1 field  
    fieldNameSize: 100, // Limit field name length
    fieldSize: 1024 * 1024 // Limit field value size to 1MB
  },
  fileFilter: articleFilter
});

module.exports = {
  uploadAvatar,
  uploadArticleImage,
  uploadDirs
};
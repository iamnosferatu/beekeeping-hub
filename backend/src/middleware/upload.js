// backend/src/middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

// Create multer instances
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: imageFilter
});

const uploadArticleImage = multer({
  storage: articleStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: imageFilter
});

module.exports = {
  uploadAvatar,
  uploadArticleImage,
  uploadDirs
};
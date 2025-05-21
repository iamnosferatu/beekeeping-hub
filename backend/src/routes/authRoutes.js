// backend/src/routes/authRoutes.js
const express = require("express");
const { protect } = require("../middleware/auth");
const authController = require("../controllers/authController");

const router = express.Router();

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes
router.get("/me", protect, authController.getMe);
router.put("/profile", protect, authController.updateProfile);
router.put("/password", protect, authController.changePassword);

module.exports = router;

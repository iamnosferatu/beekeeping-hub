// ============================================================================
// backend/src/routes/authRoutes.js - WITH VALIDATION
// ============================================================================

const express = require("express");
const { protect } = require("../middleware/auth");
const {
  validateUserRegister,
  validateUserLogin,
  validateUserProfileUpdate,
  validateUserPasswordChange,
} = require("../middleware/validation");
const authController = require("../controllers/authController");

const router = express.Router();

// Public routes
router.post("/register", validateUserRegister, authController.register);
router.post("/login", validateUserLogin, authController.login);

// Protected routes
router.get("/me", protect, authController.getMe);
router.put(
  "/profile",
  protect,
  validateUserProfileUpdate,
  authController.updateProfile
);
router.put(
  "/password",
  protect,
  validateUserPasswordChange,
  authController.changePassword
);

module.exports = router;

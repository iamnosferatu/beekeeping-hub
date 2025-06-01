// backend/src/routes/contactRoutes.js
const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/vaildator");
const { contactFormValidation } = require("../validators/contactValidator");
const { rateLimiters } = require("../middleware/enhancedRateLimiter");
const {
  submitContactForm,
  getContactMessages,
  getContactMessage,
  updateContactStatus,
  deleteContactMessage,
  getContactStats,
} = require("../controllers/contactController");

const router = express.Router();

// Public routes
router.post("/", rateLimiters.contactForm, contactFormValidation, validate, submitContactForm);

// Admin routes
router.get("/admin/contacts", protect, authorize("admin"), getContactMessages);
router.get("/admin/contacts/stats", protect, authorize("admin"), getContactStats);
router.get("/admin/contacts/:id", protect, authorize("admin"), getContactMessage);
router.put("/admin/contacts/:id/status", protect, authorize("admin"), updateContactStatus);
router.delete("/admin/contacts/:id", protect, authorize("admin"), deleteContactMessage);

module.exports = router;
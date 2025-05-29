// backend/src/routes/newsletterRoutes.js
const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const newsletterController = require("../controllers/newsletterController");

const router = express.Router();

// Public routes
router.post("/subscribe", newsletterController.subscribe);
router.get("/unsubscribe/:token", newsletterController.unsubscribe);
router.get("/status/:email", newsletterController.checkStatus);

// Admin routes
router.get(
  "/subscribers",
  protect,
  authorize("admin"),
  newsletterController.getSubscribers
);

router.get(
  "/export",
  protect,
  authorize("admin"),
  newsletterController.exportSubscribers
);

module.exports = router;
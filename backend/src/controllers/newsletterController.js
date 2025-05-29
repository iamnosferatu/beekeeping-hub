// backend/src/controllers/newsletterController.js
const { Newsletter } = require("../models");
const crypto = require("crypto");

/**
 * Newsletter Controller
 *
 * Handles newsletter subscription and unsubscription
 */
const newsletterController = {
  /**
   * Subscribe to newsletter
   * @route POST /api/newsletter/subscribe
   * @access Public
   */
  subscribe: async (req, res, next) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      // Check if already subscribed
      const existingSubscriber = await Newsletter.findOne({
        where: { email: email.toLowerCase() },
      });

      if (existingSubscriber) {
        if (existingSubscriber.status === "active") {
          return res.status(200).json({
            success: true,
            message: "You are already subscribed to our newsletter",
          });
        } else {
          // Reactivate subscription
          existingSubscriber.status = "active";
          existingSubscriber.subscribed_at = new Date();
          existingSubscriber.unsubscribed_at = null;
          await existingSubscriber.save();

          return res.status(200).json({
            success: true,
            message: "Welcome back! Your subscription has been reactivated",
          });
        }
      }

      // Generate unsubscribe token
      const token = crypto.randomBytes(32).toString("hex");

      // Create new subscriber
      const subscriber = await Newsletter.create({
        email: email.toLowerCase(),
        token,
        ip_address: req.ip || req.connection.remoteAddress,
      });

      res.status(201).json({
        success: true,
        message: "Thank you for subscribing to our newsletter!",
        data: {
          email: subscriber.email,
          subscribed_at: subscriber.subscribed_at,
        },
      });
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address",
        });
      }

      next(error);
    }
  },

  /**
   * Unsubscribe from newsletter
   * @route GET /api/newsletter/unsubscribe/:token
   * @access Public
   */
  unsubscribe: async (req, res, next) => {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Invalid unsubscribe link",
        });
      }

      // Find subscriber by token
      const subscriber = await Newsletter.findOne({
        where: { token, status: "active" },
      });

      if (!subscriber) {
        return res.status(404).json({
          success: false,
          message: "Subscription not found or already unsubscribed",
        });
      }

      // Update status
      subscriber.status = "unsubscribed";
      subscriber.unsubscribed_at = new Date();
      await subscriber.save();

      res.status(200).json({
        success: true,
        message: "You have been successfully unsubscribed from our newsletter",
      });
    } catch (error) {
      console.error("Newsletter unsubscribe error:", error);
      next(error);
    }
  },

  /**
   * Check subscription status
   * @route GET /api/newsletter/status/:email
   * @access Public
   */
  checkStatus: async (req, res, next) => {
    try {
      const { email } = req.params;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const subscriber = await Newsletter.findOne({
        where: { email: email.toLowerCase() },
        attributes: ["email", "status", "subscribed_at", "unsubscribed_at", "token"],
      });

      if (!subscriber) {
        return res.status(200).json({
          success: true,
          data: {
            isSubscribed: false,
            status: "not_subscribed",
          },
        });
      }

      res.status(200).json({
        success: true,
        data: {
          isSubscribed: subscriber.status === "active",
          status: subscriber.status,
          subscribed_at: subscriber.subscribed_at,
          unsubscribed_at: subscriber.unsubscribed_at,
          token: subscriber.token,
        },
      });
    } catch (error) {
      console.error("Newsletter status check error:", error);
      next(error);
    }
  },

  /**
   * Get all subscribers (admin only)
   * @route GET /api/newsletter/subscribers
   * @access Admin
   */
  getSubscribers: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      const status = req.query.status || "active";

      const whereClause = {};
      if (status !== "all") {
        whereClause.status = status;
      }

      const { count, rows: subscribers } = await Newsletter.findAndCountAll({
        where: whereClause,
        order: [["subscribed_at", "DESC"]],
        limit,
        offset,
        attributes: [
          "id",
          "email",
          "status",
          "subscribed_at",
          "unsubscribed_at",
        ],
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
        success: true,
        data: subscribers,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit,
        },
      });
    } catch (error) {
      console.error("Get subscribers error:", error);
      next(error);
    }
  },

  /**
   * Export subscribers (admin only)
   * @route GET /api/newsletter/export
   * @access Admin
   */
  exportSubscribers: async (req, res, next) => {
    try {
      const status = req.query.status || "active";

      const whereClause = {};
      if (status !== "all") {
        whereClause.status = status;
      }

      const subscribers = await Newsletter.findAll({
        where: whereClause,
        attributes: ["email", "subscribed_at"],
        order: [["subscribed_at", "DESC"]],
      });

      // Create CSV content
      const csvHeader = "Email,Subscribed Date\n";
      const csvContent = subscribers
        .map((sub) => `${sub.email},${sub.subscribed_at}`)
        .join("\n");

      const csv = csvHeader + csvContent;

      // Set headers for file download
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=newsletter-subscribers-${Date.now()}.csv`
      );

      res.status(200).send(csv);
    } catch (error) {
      console.error("Export subscribers error:", error);
      next(error);
    }
  },
};

module.exports = newsletterController;
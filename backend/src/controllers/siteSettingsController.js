// backend/src/controllers/siteSettingsController.js
const { SiteSettings, User } = require("../models");

/**
 * Site Settings Controller
 *
 * Manages site-wide settings including maintenance mode and alert banners.
 * Only accessible by admin users.
 */
const siteSettingsController = {
  /**
   * Get current site settings
   * @route GET /api/site-settings
   * @access Public (anyone can check if site is in maintenance)
   */
  getSettings: async (req, res, next) => {
    try {
      // First, try to find existing settings
      let settings = await SiteSettings.findOne({
        include: [
          {
            model: User,
            as: "updatedBy",
            attributes: ["id", "username", "first_name", "last_name"],
          },
        ],
      });

      // If no settings exist, create default settings
      if (!settings) {
        console.log("No site settings found, creating defaults...");
        settings = await SiteSettings.create({
          maintenance_mode: false,
          maintenance_title: "Site Under Maintenance",
          maintenance_message:
            "We're currently performing scheduled maintenance. We'll be back online shortly. Thank you for your patience!",
          alert_enabled: false,
          alert_type: "info",
          alert_message: "",
          alert_dismissible: true,
        });
      }

      // For public access, only return necessary fields
      const isAdmin = req.user && req.user.role === "admin";

      if (!isAdmin) {
        // Public users only get minimal info
        const publicSettings = {
          maintenance_mode: settings.maintenance_mode,
          maintenance_title: settings.maintenance_title,
          maintenance_message: settings.maintenance_message,
          maintenance_estimated_time: settings.maintenance_estimated_time,
          alert_enabled: settings.alert_enabled,
          alert_type: settings.alert_type,
          alert_message: settings.alert_message,
          alert_dismissible: settings.alert_dismissible,
          alert_link_text: settings.alert_link_text,
          alert_link_url: settings.alert_link_url,
        };

        return res.status(200).json({
          success: true,
          data: publicSettings,
        });
      }

      // Admins get full settings including update info
      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      console.error("Error fetching site settings:", error);
      next(error);
    }
  },

  /**
   * Update site settings
   * @route PUT /api/site-settings
   * @access Private (Admin only)
   */
  updateSettings: async (req, res, next) => {
    try {
      // Find or create settings
      let settings = await SiteSettings.findOne();

      if (!settings) {
        settings = await SiteSettings.create({});
      }

      // Extract allowed fields from request body
      const {
        maintenance_mode,
        maintenance_title,
        maintenance_message,
        maintenance_estimated_time,
        alert_enabled,
        alert_type,
        alert_message,
        alert_dismissible,
        alert_link_text,
        alert_link_url,
      } = req.body;

      // Update maintenance settings if provided
      if (maintenance_mode !== undefined) {
        settings.maintenance_mode = maintenance_mode;
        console.log(
          `Maintenance mode ${maintenance_mode ? "enabled" : "disabled"} by admin ${req.user.id}`
        );
      }

      if (maintenance_title !== undefined) {
        settings.maintenance_title = maintenance_title;
      }

      if (maintenance_message !== undefined) {
        settings.maintenance_message = maintenance_message;
      }

      if (maintenance_estimated_time !== undefined) {
        settings.maintenance_estimated_time =
          maintenance_estimated_time || null;
      }

      // Update alert settings if provided
      if (alert_enabled !== undefined) {
        settings.alert_enabled = alert_enabled;
        console.log(
          `Alert banner ${alert_enabled ? "enabled" : "disabled"} by admin ${req.user.id}`
        );
      }

      if (alert_type !== undefined) {
        const validTypes = ["info", "warning", "success", "danger"];
        if (validTypes.includes(alert_type)) {
          settings.alert_type = alert_type;
        } else {
          return res.status(400).json({
            success: false,
            message: `Invalid alert type. Must be one of: ${validTypes.join(", ")}`,
          });
        }
      }

      if (alert_message !== undefined) {
        settings.alert_message = alert_message;
      }

      if (alert_dismissible !== undefined) {
        settings.alert_dismissible = alert_dismissible;
      }

      if (alert_link_text !== undefined) {
        settings.alert_link_text = alert_link_text || null;
      }

      if (alert_link_url !== undefined) {
        settings.alert_link_url = alert_link_url || null;
      }

      // Track who made the update
      settings.updated_by = req.user.id;

      // Save changes
      await settings.save();

      // Reload with associations
      await settings.reload({
        include: [
          {
            model: User,
            as: "updatedBy",
            attributes: ["id", "username", "first_name", "last_name"],
          },
        ],
      });

      res.status(200).json({
        success: true,
        message: "Site settings updated successfully",
        data: settings,
      });
    } catch (error) {
      console.error("Error updating site settings:", error);
      next(error);
    }
  },

  /**
   * Toggle maintenance mode quickly
   * @route POST /api/site-settings/maintenance/toggle
   * @access Private (Admin only)
   */
  toggleMaintenanceMode: async (req, res, next) => {
    try {
      let settings = await SiteSettings.findOne();

      if (!settings) {
        settings = await SiteSettings.create({});
      }

      // Toggle maintenance mode
      settings.maintenance_mode = !settings.maintenance_mode;
      settings.updated_by = req.user.id;

      await settings.save();

      console.log(
        `Maintenance mode ${settings.maintenance_mode ? "enabled" : "disabled"} by admin ${req.user.id}`
      );

      res.status(200).json({
        success: true,
        message: `Maintenance mode ${settings.maintenance_mode ? "enabled" : "disabled"}`,
        data: {
          maintenance_mode: settings.maintenance_mode,
        },
      });
    } catch (error) {
      console.error("Error toggling maintenance mode:", error);
      next(error);
    }
  },

  /**
   * Toggle alert banner quickly
   * @route POST /api/site-settings/alert/toggle
   * @access Private (Admin only)
   */
  toggleAlert: async (req, res, next) => {
    try {
      let settings = await SiteSettings.findOne();

      if (!settings) {
        settings = await SiteSettings.create({});
      }

      // Check if there's a message to display
      if (!settings.alert_enabled && !settings.alert_message) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot enable alert without a message. Please set an alert message first.",
        });
      }

      // Toggle alert
      settings.alert_enabled = !settings.alert_enabled;
      settings.updated_by = req.user.id;

      await settings.save();

      console.log(
        `Alert banner ${settings.alert_enabled ? "enabled" : "disabled"} by admin ${req.user.id}`
      );

      res.status(200).json({
        success: true,
        message: `Alert banner ${settings.alert_enabled ? "enabled" : "disabled"}`,
        data: {
          alert_enabled: settings.alert_enabled,
        },
      });
    } catch (error) {
      console.error("Error toggling alert:", error);
      next(error);
    }
  },
};

module.exports = siteSettingsController;

// backend/src/middleware/maintenanceMode.js
const { SiteSettings } = require("../models");

/**
 * Maintenance Mode Middleware
 *
 * This middleware checks if the site is in maintenance mode and blocks
 * access to all routes except:
 * - Site settings endpoint (to check maintenance status)
 * - Admin login endpoint (so admins can still access the site)
 * - Health check endpoint
 */
const maintenanceMode = async (req, res, next) => {
  try {
    // Skip maintenance check for specific routes
    const exemptPaths = [
      "/api/site-settings",
      "/api/auth/login",
      "/api/auth/me",
      "/api/health",
      "/api",
    ];

    // Check if the current path is exempt
    const isExempt = exemptPaths.some(
      (path) => req.path === path || req.path.startsWith(path + "/")
    );

    // Also allow admin routes for authenticated admins
    if (
      req.path.startsWith("/api/admin") &&
      req.user &&
      req.user.role === "admin"
    ) {
      return next();
    }

    // Get current site settings
    const settings = await SiteSettings.findOne({
      attributes: [
        "maintenance_mode",
        "maintenance_title",
        "maintenance_message",
        "maintenance_estimated_time",
      ],
    });

    // If no settings or maintenance mode is off, continue normally
    if (!settings || !settings.maintenance_mode) {
      return next();
    }

    // If maintenance mode is on and this isn't an exempt path
    if (!isExempt) {
      // Check if user is admin (they can bypass maintenance)
      if (req.user && req.user.role === "admin") {
        // Add a header to indicate site is in maintenance (for frontend)
        res.setHeader("X-Maintenance-Mode", "true");
        return next();
      }

      // Return maintenance response
      return res.status(503).json({
        success: false,
        maintenance: true,
        title: settings.maintenance_title,
        message: settings.maintenance_message,
        estimatedTime: settings.maintenance_estimated_time,
      });
    }

    next();
  } catch (error) {
    console.error("Error in maintenance mode middleware:", error);
    // If there's an error checking maintenance mode, allow the request
    // to prevent the middleware from breaking the entire site
    next();
  }
};

module.exports = maintenanceMode;

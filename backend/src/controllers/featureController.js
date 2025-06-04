// backend/src/controllers/featureController.js
const { Feature } = require("../models");

/**
 * Feature Controller
 *
 * Manages feature flags for the application.
 * Only accessible by admin users.
 */
const featureController = {
  /**
   * Get all features
   * @route GET /api/features
   * @access Private (Admin only)
   */
  getAllFeatures: async (req, res, next) => {
    try {
      const features = await Feature.getAllFeatures();
      
      res.status(200).json({
        success: true,
        data: features,
      });
    } catch (error) {
      console.error("Error fetching features:", error);
      next(error);
    }
  },

  /**
   * Get a specific feature status
   * @route GET /api/features/:name
   * @access Public (for checking if features are enabled)
   */
  getFeatureStatus: async (req, res, next) => {
    try {
      const { name } = req.params;
      const enabled = await Feature.getFeatureStatus(name);
      
      res.status(200).json({
        success: true,
        data: {
          name,
          enabled,
        },
      });
    } catch (error) {
      console.error("Error fetching feature status:", error);
      next(error);
    }
  },

  /**
   * Toggle a feature
   * @route PUT /api/features/:name
   * @access Private (Admin only)
   */
  toggleFeature: async (req, res, next) => {
    try {
      const { name } = req.params;
      const { enabled } = req.body;

      if (typeof enabled !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: "Enabled must be a boolean value",
        });
      }

      const feature = await Feature.toggleFeature(name, enabled);
      
      console.log(
        `Feature '${name}' ${enabled ? "enabled" : "disabled"} by admin ${req.user.id}`
      );

      res.status(200).json({
        success: true,
        message: `Feature '${name}' ${enabled ? "enabled" : "disabled"}`,
        data: feature,
      });
    } catch (error) {
      console.error("Error toggling feature:", error);
      next(error);
    }
  },

  /**
   * Create a new feature flag
   * @route POST /api/features
   * @access Private (Admin only)
   */
  createFeature: async (req, res, next) => {
    try {
      const { name, enabled = false } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Feature name is required",
        });
      }

      // Ensure name is lowercase
      const featureName = name.toLowerCase();

      // Check if feature already exists
      const existingFeature = await Feature.findOne({
        where: { name: featureName }
      });

      if (existingFeature) {
        return res.status(400).json({
          success: false,
          message: "Feature already exists",
        });
      }

      const feature = await Feature.create({
        name: featureName,
        enabled,
        last_modified: new Date()
      });

      console.log(
        `Feature '${featureName}' created by admin ${req.user.id}`
      );

      res.status(201).json({
        success: true,
        message: `Feature '${featureName}' created successfully`,
        data: feature,
      });
    } catch (error) {
      console.error("Error creating feature:", error);
      next(error);
    }
  },

  /**
   * Delete a feature flag
   * @route DELETE /api/features/:name
   * @access Private (Admin only)
   */
  deleteFeature: async (req, res, next) => {
    try {
      const { name } = req.params;

      // Prevent deletion of core features
      const protectedFeatures = ['forum'];
      if (protectedFeatures.includes(name)) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete protected feature",
        });
      }

      const feature = await Feature.findOne({
        where: { name }
      });

      if (!feature) {
        return res.status(404).json({
          success: false,
          message: "Feature not found",
        });
      }

      await feature.destroy();

      console.log(
        `Feature '${name}' deleted by admin ${req.user.id}`
      );

      res.status(200).json({
        success: true,
        message: `Feature '${name}' deleted successfully`,
      });
    } catch (error) {
      console.error("Error deleting feature:", error);
      next(error);
    }
  },

  /**
   * Check if forum feature is enabled (backward compatibility)
   * @route GET /api/site-settings/forum
   * @access Public
   */
  isForumEnabled: async (req, res, next) => {
    try {
      const enabled = await Feature.getFeatureStatus('forum');
      
      res.status(200).json({
        success: true,
        data: {
          forum_enabled: enabled,
        },
      });
    } catch (error) {
      console.error("Error checking forum status:", error);
      next(error);
    }
  },
};

module.exports = featureController;
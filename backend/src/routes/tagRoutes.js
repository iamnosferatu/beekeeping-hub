// backend/src/routes/tagRoutes.js
const express = require("express");
const router = express.Router();

// Define controller functions
const tagController = {
  getTags: async (req, res, next) => {
    try {
      res.status(200).json({
        success: true,
        data: [
          {
            id: 1,
            name: "Beginner",
            slug: "beginner",
            description: "Articles for beginners",
          },
          {
            id: 2,
            name: "Advanced",
            slug: "advanced",
            description: "Advanced topics",
          },
          {
            id: 3,
            name: "Equipment",
            slug: "equipment",
            description: "Equipment related articles",
          },
        ],
      });
    } catch (error) {
      next(error);
    }
  },

  getTag: async (req, res, next) => {
    try {
      res.status(200).json({
        success: true,
        data: {
          id: 1,
          name: "Beginner",
          slug: req.params.slug,
          description: "Articles for beginners",
          articles: [],
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

// Public routes
router.get("/", tagController.getTags);
router.get("/:slug", tagController.getTag);

module.exports = router;

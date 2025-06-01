// backend/src/controllers/tagController.js
const { Tag, Article, User, sequelize } = require("../models");
const { Op } = require("sequelize");
const slug = require("slug");

/**
 * Tag Controller
 *
 * Handles all tag-related operations including creation,
 * retrieval, updating, and deletion of tags.
 */
const tagController = {
  /**
   * Get all tags
   * @route GET /api/tags
   * @access Public
   */
  getTags: async (req, res, next) => {
    try {
      // Optional search functionality
      const { search } = req.query;

      // Build where clause for search
      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
        ];
      }

      // Get all tags with article count
      const tags = await Tag.findAll({
        where: whereClause,
        attributes: [
          "id",
          "name",
          "slug",
          "description",
          "created_at",
          "updated_at",
          // Add article count for each tag
          [
            sequelize.literal(`(
              SELECT COUNT(DISTINCT article_tags.article_id)
              FROM article_tags
              WHERE article_tags.tag_id = Tag.id
            )`),
            "article_count",
          ],
        ],
        order: [["name", "ASC"]],
      });

      res.status(200).json({
        success: true,
        data: tags,
        count: tags.length,
      });
    } catch (error) {
      console.error("Error fetching tags:", error);
      next(error);
    }
  },

  /**
   * Get single tag by slug with associated articles
   * @route GET /api/tags/:slug
   * @access Public
   */
  getTag: async (req, res, next) => {
    try {
      const { slug } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Find tag by slug
      const tag = await Tag.findOne({
        where: { slug },
        attributes: ["id", "name", "slug", "description"],
      });

      if (!tag) {
        return res.status(404).json({
          success: false,
          message: "Tag not found",
        });
      }

      // Get articles with this tag (only published and non-blocked)
      const { count, rows: articles } = await Article.findAndCountAll({
        include: [
          {
            model: Tag,
            as: "tags",
            where: { id: tag.id },
            through: { attributes: [] }, // Don't include junction table data
          },
          {
            model: User,
            as: "author",
            attributes: ["id", "username", "first_name", "last_name", "avatar"],
          },
        ],
        where: {
          status: "published",
          blocked: false,
        },
        order: [["published_at", "DESC"]],
        limit,
        offset,
        distinct: true, // Important for accurate count with joins
      });

      const totalPages = Math.ceil(count / limit);

      // Return tag with paginated articles
      res.status(200).json({
        success: true,
        data: {
          ...tag.toJSON(),
          articles,
          article_count: count,
          pagination: {
            page,
            limit,
            totalPages,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching tag:", error);
      next(error);
    }
  },

  /**
   * Create a new tag (Admin only)
   * @route POST /api/tags
   * @access Private (Admin)
   */
  createTag: async (req, res, next) => {
    try {
      const { name, description } = req.body;

      // Validate input
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Tag name is required",
        });
      }

      // Check if tag already exists
      const existingTag = await Tag.findOne({
        where: { name: name.trim() },
      });

      if (existingTag) {
        return res.status(400).json({
          success: false,
          message: "Tag already exists",
        });
      }

      // Generate slug
      const tagSlug = slug(name.trim(), { lower: true });

      // Create tag
      const tag = await Tag.create({
        name: name.trim(),
        slug: tagSlug,
        description: description || null,
      });

      res.status(201).json({
        success: true,
        message: "Tag created successfully",
        data: tag,
      });
    } catch (error) {
      console.error("Error creating tag:", error);
      next(error);
    }
  },

  /**
   * Update a tag (Admin only)
   * @route PUT /api/tags/:id
   * @access Private (Admin)
   */
  updateTag: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      // Find tag
      const tag = await Tag.findByPk(id);

      if (!tag) {
        return res.status(404).json({
          success: false,
          message: "Tag not found",
        });
      }

      // If name is being changed, check for duplicates
      if (name && name.trim() !== tag.name) {
        const existingTag = await Tag.findOne({
          where: {
            name: name.trim(),
            id: { [Op.ne]: id }, // Exclude current tag
          },
        });

        if (existingTag) {
          return res.status(400).json({
            success: false,
            message: "Tag with this name already exists",
          });
        }

        // Update name and regenerate slug
        tag.name = name.trim();
        tag.slug = slug(name.trim(), { lower: true });
      }

      // Update description if provided
      if (description !== undefined) {
        tag.description = description;
      }

      await tag.save();

      res.status(200).json({
        success: true,
        message: "Tag updated successfully",
        data: tag,
      });
    } catch (error) {
      console.error("Error updating tag:", error);
      next(error);
    }
  },

  /**
   * Delete a tag (Admin only)
   * @route DELETE /api/tags/:id
   * @access Private (Admin)
   */
  deleteTag: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Find tag
      const tag = await Tag.findByPk(id);

      if (!tag) {
        return res.status(404).json({
          success: false,
          message: "Tag not found",
        });
      }

      // Delete tag (will also remove associations due to CASCADE)
      await tag.destroy();

      res.status(200).json({
        success: true,
        message: "Tag deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting tag:", error);
      next(error);
    }
  },

  /**
   * Get popular tags (by article count)
   * @route GET /api/tags/popular
   * @access Public
   */
  getPopularTags: async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 10;

      // Get tags ordered by article count
      const tags = await Tag.findAll({
        attributes: [
          "id",
          "name",
          "slug",
          [
            sequelize.literal(`(
              SELECT COUNT(DISTINCT article_tags.article_id)
              FROM article_tags
              INNER JOIN articles ON article_tags.article_id = articles.id
              WHERE article_tags.tag_id = Tag.id
              AND articles.status = 'published'
              AND articles.blocked = false
            )`),
            "article_count",
          ],
        ],
        order: [[sequelize.literal("article_count"), "DESC"]],
        limit,
      });
      
      // Filter out tags with no articles
      const filteredTags = tags.filter(tag => tag.get('article_count') > 0);

      res.status(200).json({
        success: true,
        data: filteredTags,
      });
    } catch (error) {
      console.error("Error fetching popular tags:", error);
      next(error);
    }
  },
};

module.exports = tagController;

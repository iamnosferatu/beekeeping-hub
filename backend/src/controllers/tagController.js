// backend/src/controllers/tagController.js - REAL DATABASE QUERIES
const { Tag, Article, sequelize } = require("../models");
const { Op } = require("sequelize");
const slug = require("slug");

// @desc    Get all tags with article counts
// @route   GET /api/tags
// @access  Public
exports.getTags = async (req, res, next) => {
  try {
    console.log("Fetching all tags from database...");

    // Get tags with article counts
    const tags = await Tag.findAll({
      attributes: [
        "id",
        "name",
        "slug",
        "description",
        "created_at",
        "updated_at",
        // Count published articles for each tag
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM article_tags at
            INNER JOIN articles a ON at.article_id = a.id
            WHERE at.tag_id = Tag.id AND a.status = 'published'
          )`),
          "article_count",
        ],
      ],
      order: [
        // Order by article count descending, then by name
        [sequelize.literal("article_count"), "DESC"],
        ["name", "ASC"],
      ],
    });

    console.log(`Found ${tags.length} tags`);

    // Convert to plain objects and ensure article_count is a number
    const formattedTags = tags.map((tag) => {
      const tagData = tag.toJSON();
      tagData.article_count = parseInt(tagData.article_count) || 0;
      return tagData;
    });

    res.status(200).json({
      success: true,
      data: formattedTags,
      count: formattedTags.length,
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    next(error);
  }
};

// @desc    Get single tag by slug with articles
// @route   GET /api/tags/:slug
// @access  Public
exports.getTag = async (req, res, next) => {
  try {
    const { slug: tagSlug } = req.params;

    console.log(`Fetching tag by slug: ${tagSlug}`);

    // Find tag
    const tag = await Tag.findOne({
      where: { slug: tagSlug },
      include: [
        {
          model: Article,
          as: "articles",
          where: { status: "published" },
          required: false,
          attributes: [
            "id",
            "title",
            "slug",
            "excerpt",
            "featured_image",
            "published_at",
            "view_count",
          ],
          include: [
            {
              model: require("../models").User,
              as: "author",
              attributes: ["id", "username", "first_name", "last_name"],
            },
          ],
          order: [["published_at", "DESC"]],
        },
      ],
    });

    if (!tag) {
      console.log(`Tag not found: ${tagSlug}`);
      return res.status(404).json({
        success: false,
        message: "Tag not found",
      });
    }

    console.log(`Found tag: ${tag.name} with ${tag.articles.length} articles`);

    res.status(200).json({
      success: true,
      data: tag,
    });
  } catch (error) {
    console.error("Error fetching tag:", error);
    next(error);
  }
};

// @desc    Create a new tag
// @route   POST /api/tags
// @access  Private (author, admin)
exports.createTag = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    console.log(`Creating new tag: ${name}`);

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Tag name is required",
      });
    }

    const trimmedName = name.trim();

    // Check if tag already exists
    const existingTag = await Tag.findOne({
      where: {
        [Op.or]: [
          { name: trimmedName },
          { slug: slug(trimmedName, { lower: true }) },
        ],
      },
    });

    if (existingTag) {
      console.log(`Tag already exists: ${trimmedName}`);
      return res.status(400).json({
        success: false,
        message: "Tag with this name already exists",
      });
    }

    // Create tag
    const tag = await Tag.create({
      name: trimmedName,
      slug: slug(trimmedName, { lower: true }),
      description: description ? description.trim() : null,
    });

    console.log(`Tag created successfully: ${tag.name} (${tag.slug})`);

    res.status(201).json({
      success: true,
      data: tag,
    });
  } catch (error) {
    console.error("Error creating tag:", error);
    next(error);
  }
};

// @desc    Update a tag
// @route   PUT /api/tags/:id
// @access  Private (admin only)
exports.updateTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    console.log(`Updating tag ${id}`);

    // Find tag
    const tag = await Tag.findByPk(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found",
      });
    }

    // Update fields if provided
    if (name && name.trim()) {
      const trimmedName = name.trim();

      // Check if new name conflicts with existing tag
      const existingTag = await Tag.findOne({
        where: {
          [Op.and]: [
            { id: { [Op.ne]: id } }, // Not the current tag
            {
              [Op.or]: [
                { name: trimmedName },
                { slug: slug(trimmedName, { lower: true }) },
              ],
            },
          ],
        },
      });

      if (existingTag) {
        return res.status(400).json({
          success: false,
          message: "Tag with this name already exists",
        });
      }

      tag.name = trimmedName;
      tag.slug = slug(trimmedName, { lower: true });
    }

    if (description !== undefined) {
      tag.description = description ? description.trim() : null;
    }

    await tag.save();

    console.log(`Tag ${id} updated successfully`);

    res.status(200).json({
      success: true,
      data: tag,
    });
  } catch (error) {
    console.error("Error updating tag:", error);
    next(error);
  }
};

// @desc    Delete a tag
// @route   DELETE /api/tags/:id
// @access  Private (admin only)
exports.deleteTag = async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log(`Deleting tag ${id}`);

    // Find tag
    const tag = await Tag.findByPk(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found",
      });
    }

    // Check if tag is being used by articles
    const articleCount = await sequelize.query(
      "SELECT COUNT(*) as count FROM article_tags WHERE tag_id = ?",
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (articleCount[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete tag. It is currently used by ${articleCount[0].count} article(s).`,
      });
    }

    // Delete tag
    await tag.destroy();

    console.log(`Tag ${id} deleted successfully`);

    res.status(200).json({
      success: true,
      message: "Tag deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tag:", error);
    next(error);
  }
};

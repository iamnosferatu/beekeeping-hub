// backend/src/middleware/validation.js - COMPLETE VALIDATION SYSTEM
const Joi = require("joi");

// Generic validation middleware factory
const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Show all validation errors
      stripUnknown: true, // Remove unknown fields
      allowUnknown: false, // Don't allow extra fields
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message.replace(/['"]/g, ""), // Clean up quotes
        value: detail.context?.value,
      }));

      console.log("Validation error:", errorDetails);

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errorDetails,
      });
    }

    // Replace the original request data with validated/sanitized data
    req[property] = value;
    next();
  };
};

// ============================================================================
// ARTICLE VALIDATION SCHEMAS
// ============================================================================

const articleSchemas = {
  create: Joi.object({
    title: Joi.string().min(3).max(255).trim().required().messages({
      "string.min": "Title must be at least 3 characters long",
      "string.max": "Title cannot exceed 255 characters",
      "any.required": "Title is required",
      "string.empty": "Title cannot be empty",
    }),

    content: Joi.string().min(10).required().messages({
      "string.min": "Content must be at least 10 characters long",
      "any.required": "Content is required",
      "string.empty": "Content cannot be empty",
    }),

    excerpt: Joi.string().max(500).trim().allow("").optional().messages({
      "string.max": "Excerpt cannot exceed 500 characters",
    }),

    featured_image: Joi.string()
      .uri({ scheme: ["http", "https"] })
      .allow("")
      .optional()
      .messages({
        "string.uri": "Featured image must be a valid URL",
      }),

    status: Joi.string()
      .valid("draft", "published", "archived")
      .default("draft")
      .messages({
        "any.only": "Status must be either draft, published, or archived",
      }),

    tags: Joi.array()
      .items(
        Joi.string()
          .min(1)
          .max(50)
          .trim()
          .pattern(/^[a-zA-Z0-9\s-]+$/)
          .messages({
            "string.pattern.base":
              "Tags can only contain letters, numbers, spaces, and hyphens",
            "string.min": "Tag must be at least 1 character long",
            "string.max": "Tag cannot exceed 50 characters",
          })
      )
      .max(5)
      .unique()
      .default([])
      .messages({
        "array.max": "Cannot have more than 5 tags",
        "array.unique": "Tags must be unique",
      }),
  }),

  update: Joi.object({
    title: Joi.string().min(3).max(255).trim().optional(),

    content: Joi.string().min(10).optional(),

    excerpt: Joi.string().max(500).trim().allow("").optional(),

    featured_image: Joi.string()
      .uri({ scheme: ["http", "https"] })
      .allow("")
      .optional(),

    status: Joi.string().valid("draft", "published", "archived").optional(),

    tags: Joi.array()
      .items(
        Joi.string()
          .min(1)
          .max(50)
          .trim()
          .pattern(/^[a-zA-Z0-9\s-]+$/)
      )
      .max(5)
      .unique()
      .optional(),
  }),
};

// ============================================================================
// COMMENT VALIDATION SCHEMAS
// ============================================================================

const commentSchemas = {
  create: Joi.object({
    content: Joi.string().min(3).max(1000).trim().required().messages({
      "string.min": "Comment must be at least 3 characters long",
      "string.max": "Comment cannot exceed 1000 characters",
      "any.required": "Comment content is required",
      "string.empty": "Comment cannot be empty",
    }),

    articleId: Joi.number().integer().positive().required().messages({
      "number.base": "Article ID must be a number",
      "number.integer": "Article ID must be an integer",
      "number.positive": "Article ID must be positive",
      "any.required": "Article ID is required",
    }),
  }),

  update: Joi.object({
    content: Joi.string().min(3).max(1000).trim().required().messages({
      "string.min": "Comment must be at least 3 characters long",
      "string.max": "Comment cannot exceed 1000 characters",
      "any.required": "Comment content is required",
    }),
  }),

  updateStatus: Joi.object({
    status: Joi.string()
      .valid("pending", "approved", "rejected")
      .required()
      .messages({
        "any.only": "Status must be pending, approved, or rejected",
        "any.required": "Status is required",
      }),
  }),
};

// ============================================================================
// TAG VALIDATION SCHEMAS
// ============================================================================

const tagSchemas = {
  create: Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .pattern(/^[a-zA-Z0-9\s-]+$/)
      .required()
      .messages({
        "string.min": "Tag name must be at least 2 characters long",
        "string.max": "Tag name cannot exceed 50 characters",
        "string.pattern.base":
          "Tag name can only contain letters, numbers, spaces, and hyphens",
        "any.required": "Tag name is required",
        "string.empty": "Tag name cannot be empty",
      }),

    description: Joi.string().max(200).trim().allow("").optional().messages({
      "string.max": "Description cannot exceed 200 characters",
    }),
  }),

  update: Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .pattern(/^[a-zA-Z0-9\s-]+$/)
      .optional(),

    description: Joi.string().max(200).trim().allow("").optional(),
  }),
};

// ============================================================================
// USER/AUTH VALIDATION SCHEMAS
// ============================================================================

const userSchemas = {
  register: Joi.object({
    username: Joi.string()
      .min(3)
      .max(50)
      .trim()
      .pattern(/^[a-zA-Z0-9_-]+$/)
      .required()
      .messages({
        "string.min": "Username must be at least 3 characters long",
        "string.max": "Username cannot exceed 50 characters",
        "string.pattern.base":
          "Username can only contain letters, numbers, underscores, and hyphens",
        "any.required": "Username is required",
      }),

    email: Joi.string()
      .email({ tlds: { allow: false } }) // Allow all TLDs
      .required()
      .messages({
        "string.email": "Please enter a valid email address",
        "any.required": "Email is required",
      }),

    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters long",
        "string.max": "Password cannot exceed 128 characters",
        "string.pattern.base":
          "Password must contain at least one lowercase letter, one uppercase letter, and one number",
        "any.required": "Password is required",
      }),

    firstName: Joi.string().min(1).max(50).trim().required().messages({
      "string.min": "First name is required",
      "string.max": "First name cannot exceed 50 characters",
      "any.required": "First name is required",
    }),

    lastName: Joi.string().min(1).max(50).trim().required().messages({
      "string.min": "Last name is required",
      "string.max": "Last name cannot exceed 50 characters",
      "any.required": "Last name is required",
    }),
  }),

  login: Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.email": "Please enter a valid email address",
        "any.required": "Email is required",
      }),

    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().min(1).max(50).trim().optional(),

    lastName: Joi.string().min(1).max(50).trim().optional(),

    email: Joi.string()
      .email({ tlds: { allow: false } })
      .optional(),

    bio: Joi.string().max(500).trim().allow("").optional().messages({
      "string.max": "Bio cannot exceed 500 characters",
    }),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      "any.required": "Current password is required",
    }),

    newPassword: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        "string.min": "New password must be at least 8 characters long",
        "string.pattern.base":
          "New password must contain at least one lowercase letter, one uppercase letter, and one number",
        "any.required": "New password is required",
      }),
  }),

  updateUserRole: Joi.object({
    role: Joi.string().valid("user", "author", "admin").required().messages({
      "any.only": "Role must be user, author, or admin",
      "any.required": "Role is required",
    }),
  }),
};

// ============================================================================
// QUERY PARAMETER VALIDATION SCHEMAS
// ============================================================================

const querySchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      "number.base": "Page must be a number",
      "number.integer": "Page must be an integer",
      "number.min": "Page must be at least 1",
    }),

    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      "number.base": "Limit must be a number",
      "number.integer": "Limit must be an integer",
      "number.min": "Limit must be at least 1",
      "number.max": "Limit cannot exceed 100",
    }),
  }),

  articleFilters: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    tag: Joi.string().min(1).optional(),
    search: Joi.string().min(2).max(100).optional().messages({
      "string.min": "Search term must be at least 2 characters",
      "string.max": "Search term cannot exceed 100 characters",
    }),
    status: Joi.string().valid("draft", "published", "archived").optional(),
  }),

  commentFilters: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    articleId: Joi.number().integer().positive().optional(),
    status: Joi.string()
      .valid("pending", "approved", "rejected", "all")
      .default("approved"),
  }),
};

// ============================================================================
// ID PARAMETER VALIDATION
// ============================================================================

const validateId = validate(
  Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "number.base": "ID must be a number",
      "number.integer": "ID must be an integer",
      "number.positive": "ID must be positive",
      "any.required": "ID is required",
    }),
  }),
  "params"
);

const validateSlug = validate(
  Joi.object({
    slug: Joi.string()
      .min(1)
      .max(255)
      .pattern(/^[a-zA-Z0-9-]+$/)
      .required()
      .messages({
        "string.min": "Slug is required",
        "string.max": "Slug is too long",
        "string.pattern.base":
          "Slug can only contain letters, numbers, and hyphens",
        "any.required": "Slug is required",
      }),
  }),
  "params"
);

// ============================================================================
// EXPORT VALIDATION FUNCTIONS
// ============================================================================

module.exports = {
  validate,
  validateId,
  validateSlug,

  // Validation middleware functions
  validateArticleCreate: validate(articleSchemas.create),
  validateArticleUpdate: validate(articleSchemas.update),
  validateArticleQuery: validate(querySchemas.articleFilters, "query"),

  validateCommentCreate: validate(commentSchemas.create),
  validateCommentUpdate: validate(commentSchemas.update),
  validateCommentStatus: validate(commentSchemas.updateStatus),
  validateCommentQuery: validate(querySchemas.commentFilters, "query"),

  validateTagCreate: validate(tagSchemas.create),
  validateTagUpdate: validate(tagSchemas.update),

  validateUserRegister: validate(userSchemas.register),
  validateUserLogin: validate(userSchemas.login),
  validateUserProfileUpdate: validate(userSchemas.updateProfile),
  validateUserPasswordChange: validate(userSchemas.changePassword),
  validateUserRoleUpdate: validate(userSchemas.updateUserRole),

  validatePagination: validate(querySchemas.pagination, "query"),

  // Raw schemas for custom validation
  schemas: {
    articles: articleSchemas,
    comments: commentSchemas,
    tags: tagSchemas,
    users: userSchemas,
    queries: querySchemas,
  },
};

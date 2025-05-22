// backend/src/utils/responseHelpers.js - STANDARDIZED RESPONSES
/**
 * Standardized API response helpers
 * Ensures consistent response format across all endpoints
 */

class ApiResponse {
  /**
   * Success response with data
   */
  static success(res, data = null, message = "Success", statusCode = 200) {
    const response = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    // Add pagination if data includes it
    if (data && typeof data === "object" && data.pagination) {
      response.pagination = data.pagination;
      response.data = data.data || data;
      delete response.data.pagination;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Success response with pagination
   */
  static successWithPagination(res, data, pagination, message = "Success") {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Created response (201)
   */
  static created(res, data = null, message = "Resource created successfully") {
    return this.success(res, data, message, 201);
  }

  /**
   * No content response (204)
   */
  static noContent(res) {
    return res.status(204).send();
  }

  /**
   * Error response
   */
  static error(
    res,
    message = "An error occurred",
    statusCode = 500,
    errors = null
  ) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    };

    // Add error details if provided
    if (errors) {
      response.errors = errors;
    }

    // Add stack trace in development
    if (process.env.NODE_ENV === "development" && statusCode >= 500) {
      response.stack = new Error().stack;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Bad request response (400)
   */
  static badRequest(res, message = "Bad request", errors = null) {
    return this.error(res, message, 400, errors);
  }

  /**
   * Unauthorized response (401)
   */
  static unauthorized(res, message = "Unauthorized access") {
    return this.error(res, message, 401);
  }

  /**
   * Forbidden response (403)
   */
  static forbidden(res, message = "Access forbidden") {
    return this.error(res, message, 403);
  }

  /**
   * Not found response (404)
   */
  static notFound(res, message = "Resource not found") {
    return this.error(res, message, 404);
  }

  /**
   * Conflict response (409)
   */
  static conflict(res, message = "Resource conflict") {
    return this.error(res, message, 409);
  }

  /**
   * Validation error response (422)
   */
  static validationError(res, errors, message = "Validation failed") {
    return this.error(res, message, 422, errors);
  }

  /**
   * Rate limit response (429)
   */
  static rateLimit(res, message = "Too many requests") {
    return this.error(res, message, 429);
  }

  /**
   * Internal server error response (500)
   */
  static internalError(res, message = "Internal server error") {
    return this.error(res, message, 500);
  }
}

/**
 * Pagination helper
 */
class PaginationHelper {
  static calculatePagination(page, limit, totalCount) {
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
      totalCount,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
    };
  }

  static getOffset(page, limit) {
    return (parseInt(page) - 1) * parseInt(limit);
  }
}

/**
 * Query helper for common database operations
 */
class QueryHelper {
  /**
   * Build where clause for search functionality
   */
  static buildSearchClause(searchTerm, fields) {
    if (!searchTerm || !fields || fields.length === 0) {
      return {};
    }

    const { Op } = require("sequelize");
    const searchPattern = `%${searchTerm}%`;

    return {
      [Op.or]: fields.map((field) => ({
        [field]: { [Op.like]: searchPattern },
      })),
    };
  }

  /**
   * Build order clause
   */
  static buildOrderClause(sortBy = "created_at", sortOrder = "DESC") {
    const validOrders = ["ASC", "DESC"];
    const order = validOrders.includes(sortOrder.toUpperCase())
      ? sortOrder.toUpperCase()
      : "DESC";

    return [[sortBy, order]];
  }

  /**
   * Sanitize query parameters
   */
  static sanitizeQuery(query) {
    const sanitized = {};

    Object.keys(query).forEach((key) => {
      const value = query[key];

      // Skip undefined, null, empty strings
      if (value !== undefined && value !== null && value !== "") {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }
}

/**
 * Cache helper for response caching
 */
class CacheHelper {
  static generateCacheKey(prefix, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});

    return `${prefix}:${JSON.stringify(sortedParams)}`;
  }

  static getCacheTTL(type = "default") {
    const ttls = {
      short: 60, // 1 minute
      default: 300, // 5 minutes
      medium: 900, // 15 minutes
      long: 3600, // 1 hour
      veryLong: 86400, // 24 hours
    };

    return ttls[type] || ttls.default;
  }
}

module.exports = {
  ApiResponse,
  PaginationHelper,
  QueryHelper,
  CacheHelper,
};

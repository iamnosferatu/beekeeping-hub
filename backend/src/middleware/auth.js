// backend/src/middleware/auth.js
const jwt = require("jsonwebtoken");
const { User } = require("../models");

// Get JWT secret from environment variables with fallback
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_here";

// Middleware to protect routes - requires valid JWT
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Debug logging
    console.log('Auth middleware - headers:', {
      authorization: req.headers.authorization ? 'Present' : 'Missing',
      authHeader: req.headers.authorization?.substring(0, 50) + '...'
    });

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1].trim();
    }

    // Check if token exists
    if (!token) {
      console.log('Auth middleware - No token found');
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get user from database
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] }, // Don't include password
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      // Set user in request
      req.user = user;
      console.log('Auth middleware - User authenticated:', {
        id: user.id,
        username: user.username,
        role: user.role
      });
      next();
    } catch (error) {
      console.error("JWT verification error:", error);

      // More specific error messages based on error type
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      } else if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired",
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "Authentication error",
        });
      }
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    next(error);
  }
};

// Middleware to check role-based permissions
exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log('Authorize middleware:', {
      requiredRoles: roles,
      userRole: req.user?.role,
      hasUser: !!req.user
    });
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    if (!roles.includes(req.user.role)) {
      console.log('Authorize failed - role not in allowed list');
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }

    console.log('Authorize passed');
    next();
  };
};

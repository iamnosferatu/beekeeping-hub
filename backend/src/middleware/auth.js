// backend/src/middleware/auth.js
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { AuthenticationError, AuthorizationError } = require("../utils/errors");

// Get JWT secret from environment variables - fail if not set
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable not set in auth middleware");
  process.exit(1);
}

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
      throw new AuthenticationError("Access token required");
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get user from database
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] }, // Don't include password
      });

      if (!user) {
        throw new AuthenticationError("User no longer exists");
      }

      // Set user in request
      req.user = user;
      console.log('Auth middleware - User authenticated:', {
        id: user.id,
        username: user.username,
        role: user.role
      });
      next();
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      
      // JWT errors are automatically handled by the enhanced error handler
      throw jwtError;
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
      throw new AuthenticationError("Authentication required");
    }

    if (!roles.includes(req.user.role)) {
      console.log('Authorize failed - role not in allowed list');
      throw new AuthorizationError(`Role '${req.user.role}' is not authorized to access this resource`);
    }

    console.log('Authorize passed');
    next();
  };
};

// backend/src/controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { Op } = require("sequelize");
const emailService = require("../services/emailService");
const { generateVerificationToken, isTokenExpired } = require("../utils/tokenGenerator");
const { 
  ValidationError, 
  ConflictError, 
  AuthenticationError,
  NotFoundError,
  asyncHandler 
} = require("../utils/errors");

// Get JWT secret from environment - fail if not set
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable not set");
  process.exit(1);
}

// Helper to generate JWT token
const generateToken = (id, rememberMe = false) => {
  try {
    const expiresIn = rememberMe ? "30d" : "7d"; // 30 days if remember me, 7 days otherwise
    const token = jwt.sign({ id }, JWT_SECRET, {
      expiresIn,
    });

    console.log(
      `Token generated for user ID: ${id}, rememberMe: ${rememberMe}, expires: ${expiresIn} (first 20 chars): ${token.substring(
        0,
        20
      )}...`
    );
    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Failed to generate authentication token");
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { username, email, password, firstName, lastName } = req.body;

  // Validate required fields
  if (!username || !email || !password) {
    throw new ValidationError("Username, email, and password are required");
  }

  if (!firstName || !lastName) {
    throw new ValidationError("First name and last name are required");
  }

  console.log(`Registration attempt for: ${email}`);

  // Check if user already exists
  const userExists = await User.findOne({
    where: {
      [Op.or]: [{ email }, { username }],
    },
  });

  if (userExists) {
    console.log(
      `Registration failed: User already exists with email ${email} or username ${username}`
    );
    
    if (userExists.email === email) {
      throw new ConflictError("An account with this email already exists");
    } else {
      throw new ConflictError("This username is already taken");
    }
  }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate email verification token
    const verificationData = generateVerificationToken();

    // Create user with initial role of 'user'
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      role: "user",
      last_login: new Date(),
      email_verified: false,
      email_verification_token: verificationData.token,
      email_verification_expires: verificationData.expires,
    });

    console.log(`User created successfully with ID: ${user.id}`);

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationData.token}`;
    console.log(`Attempting to send verification email to: ${user.email}`);
    console.log(`Verification URL: ${verificationUrl}`);
    
    const emailResult = await emailService.sendVerificationEmail(user, verificationUrl);
    console.log('Email send result:', emailResult);
    
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // Continue with registration even if email fails
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const userData = user.toJSON();
    delete userData.password;
    delete userData.email_verification_token;
    delete userData.email_verification_expires;

    const response = {
      success: true,
      token,
      user: userData,
      message: "Registration successful! Please check your email to verify your account.",
    };

    // Add preview URL for development
    if (process.env.NODE_ENV !== 'production' && emailResult.previewUrl) {
      response.emailPreviewUrl = emailResult.previewUrl;
      response.message += ` (Dev: Preview at ${emailResult.previewUrl})`;
    }

    res.status(201).json(response);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password, rememberMe } = req.body;

  // Validate required fields
  if (!email || !password) {
    throw new ValidationError("Email and password are required");
  }

  console.log(`Login attempt for: ${email}`);

  // Check if user exists
  const user = await User.findOne({ where: { email } });

  if (!user) {
    console.log(`Login failed: No user found with email ${email}`);
    throw new AuthenticationError("Invalid email or password");
  }

  // Check if password matches
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    console.log(`Login failed: Invalid password for user ${email}`);
    throw new AuthenticationError("Invalid email or password");
  }

  // Check if email is verified
  if (!user.email_verified) {
    console.log(`Login failed: Email not verified for user ${email}`);
    const error = new AuthenticationError("Please verify your email before logging in. Check your inbox for the verification link.");
    error.details = { needsVerification: true, email: user.email };
    throw error;
  }

    // Update last login time
    user.last_login = new Date();
    await user.save();

    // Generate token with remember me option
    const token = generateToken(user.id, rememberMe);

    // Remove password from response
    const userData = user.toJSON();
    delete userData.password;

  console.log(`Login successful for user ${email}, rememberMe: ${rememberMe}`);
  res.status(200).json({
    success: true,
    token,
    user: userData,
    rememberMe: !!rememberMe,
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  // req.user is set by the protect middleware
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ["password"] },
  });

  if (!user) {
    throw new NotFoundError("User");
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, bio, email, avatar } = req.body;

    console.log(`Profile update for user ID: ${req.user.id}`);

    // Find user
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if email is being changed and is already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    // Update fields
    user.first_name = firstName || user.first_name;
    user.last_name = lastName || user.last_name;
    user.bio = bio !== undefined ? bio : user.bio;
    user.email = email || user.email;
    // Note: avatar is now handled via separate upload endpoint

    // Save changes
    await user.save();

    // Remove password from response
    const userData = user.toJSON();
    delete userData.password;

    res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    console.log(`Password change attempt for user ID: ${req.user.id}`);

    // Find user
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    next(error);
  }
};

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    // Find user with this token
    const user = await User.findOne({
      where: {
        email_verification_token: token,
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification token",
      });
    }

    // Check if token has expired
    if (isTokenExpired(user.email_verification_expires)) {
      return res.status(400).json({
        success: false,
        message: "Verification token has expired. Please request a new one.",
      });
    }

    // Mark email as verified
    user.email_verified = true;
    user.email_verification_token = null;
    user.email_verification_expires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    next(error);
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists
      return res.status(200).json({
        success: true,
        message: "If your email is registered, you will receive a verification link.",
      });
    }

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new verification token
    const verificationData = generateVerificationToken();
    user.email_verification_token = verificationData.token;
    user.email_verification_expires = verificationData.expires;
    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationData.token}`;
    await emailService.sendVerificationEmail(user, verificationUrl);

    res.status(200).json({
      success: true,
      message: "Verification email sent! Please check your inbox.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    next(error);
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    console.log(`Password reset requested for: ${email}`);

    // Find user
    const user = await User.findOne({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      console.log(`Password reset failed: User not found for ${email}`);
      return res.status(200).json({
        success: true,
        message: "If your email is registered, you will receive a password reset link.",
      });
    }

    // Generate password reset token (valid for 1 hour)
    const resetData = generateVerificationToken(1);
    user.password_reset_token = resetData.token;
    user.password_reset_expires = resetData.expires;
    await user.save();

    // Send password reset email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetData.token}`;
    await emailService.sendPasswordResetEmail(user, resetUrl);

    console.log(`Password reset email sent to ${email}`);

    res.status(200).json({
      success: true,
      message: "If your email is registered, you will receive a password reset link.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    // Find user with this token
    const user = await User.findOne({
      where: {
        password_reset_token: token,
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Check if token has expired
    if (isTokenExpired(user.password_reset_expires)) {
      return res.status(400).json({
        success: false,
        message: "Reset token has expired. Please request a new password reset.",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.password_reset_token = null;
    user.password_reset_expires = null;
    await user.save();

    console.log(`Password reset successful for user ${user.email}`);

    res.status(200).json({
      success: true,
      message: "Password reset successfully! You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    next(error);
  }
};

// @desc    Test email service
// @route   POST /api/auth/test-email
// @access  Public (for debugging only)
exports.testEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    console.log(`Testing email service for: ${email}`);
    
    const testUser = {
      first_name: "Test",
      last_name: "User",
      username: "testuser",
      email: email
    };
    
    const verificationUrl = "http://localhost:3000/verify-email?token=test123";
    
    const result = await emailService.sendVerificationEmail(testUser, verificationUrl);
    
    console.log('Test email result:', result);
    
    res.status(200).json({
      success: true,
      message: "Test email sent",
      result: result
    });
  } catch (error) {
    console.error("Test email error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error: error.message
    });
  }
};

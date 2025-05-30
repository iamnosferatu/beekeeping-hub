// backend/src/controllers/uploadController.js
const fs = require("fs").promises;
const path = require("path");
const { User } = require("../models");

// @desc    Upload user avatar
// @route   POST /api/auth/avatar
// @access  Private
exports.uploadAvatar = async (req, res, next) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      // Delete uploaded file if user not found
      await fs.unlink(req.file.path);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete old avatar file if it exists and is not a placeholder
    if (user.avatar && !user.avatar.includes("/api/placeholder/") && user.avatar.startsWith("/uploads/")) {
      const oldAvatarPath = path.join(__dirname, "../..", user.avatar);
      try {
        await fs.unlink(oldAvatarPath);
      } catch (error) {
        console.log("Error deleting old avatar:", error);
      }
    }

    // Update user avatar path
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      avatar: avatarUrl,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        bio: user.bio,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    // Delete uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError);
      }
    }
    console.error("Avatar upload error:", error);
    next(error);
  }
};

// @desc    Delete user avatar
// @route   DELETE /api/auth/avatar
// @access  Private
exports.deleteAvatar = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete avatar file if it exists and is not a placeholder
    if (user.avatar && !user.avatar.includes("/api/placeholder/") && user.avatar.startsWith("/uploads/")) {
      const avatarPath = path.join(__dirname, "../..", user.avatar);
      try {
        await fs.unlink(avatarPath);
      } catch (error) {
        console.log("Error deleting avatar file:", error);
      }
    }

    // Reset avatar to null
    user.avatar = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Avatar deleted successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        bio: user.bio,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Avatar delete error:", error);
    next(error);
  }
};
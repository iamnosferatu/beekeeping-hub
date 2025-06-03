const { ForumComment, ForumThread, User, UserForumBan, SiteSettings } = require('../models');
const { asyncHandler } = require('../utils/errors');

// Check if user is banned from forum
const checkForumBan = async (userId) => {
  return await UserForumBan.isUserBanned(userId);
};

// @desc    Create a new comment
// @route   POST /api/forum/comments
// @access  Author/Admin
exports.createComment = asyncHandler(async (req, res) => {
  console.log('Creating forum comment - Request body:', req.body);
  console.log('User:', req.user?.id, req.user?.role);
  
  // Check if forum is enabled
  const settings = await SiteSettings.findOne();
  if (!settings?.forum_enabled) {
    return res.status(403).json({
      success: false,
      message: 'Forum feature is currently disabled'
    });
  }

  // Check if user is banned
  try {
    const isBanned = await checkForumBan(req.user.id);
    if (isBanned) {
      return res.status(403).json({
        success: false,
        message: 'You are banned from participating in the forum'
      });
    }
  } catch (banError) {
    console.error('Error checking forum ban:', banError);
    // Continue if ban check fails
  }

  // Only authors and admins can create comments
  if (req.user.role !== 'author' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only authors and admins can post comments in the forum'
    });
  }

  const { content, threadId, parentCommentId } = req.body;

  // Verify thread exists and is not locked/blocked
  const thread = await ForumThread.findByPk(threadId);
  if (!thread) {
    return res.status(404).json({
      success: false,
      message: 'Thread not found'
    });
  }

  // Check if thread can receive comments
  if (thread.isLocked || thread.isBlocked) {
    return res.status(403).json({
      success: false,
      message: 'This thread is locked or blocked and cannot receive new comments'
    });
  }

  // Verify parent comment exists if provided
  if (parentCommentId) {
    const parentComment = await ForumComment.findByPk(parentCommentId);
    if (!parentComment || parentComment.threadId !== parseInt(threadId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid parent comment'
      });
    }
  }

  const comment = await ForumComment.create({
    content,
    threadId,
    userId: req.user.id,
    parentCommentId
  });

  // Update thread's last activity
  try {
    thread.lastActivityAt = new Date();
    await thread.save();
  } catch (err) {
    console.error('Error updating thread last activity:', err);
    // Don't fail the comment creation if this fails
  }

  const commentWithDetails = await ForumComment.findByPk(comment.id, {
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'avatar']
      },
      {
        model: ForumComment,
        as: 'parentComment',
        attributes: ['id', 'content'],
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username']
          }
        ]
      }
    ]
  });

  res.status(201).json({
    success: true,
    data: commentWithDetails
  });
});

// @desc    Update a comment
// @route   PUT /api/forum/comments/:id
// @access  Owner/Admin
exports.updateComment = asyncHandler(async (req, res) => {
  // Check if forum is enabled
  const settings = await SiteSettings.findOne();
  if (!settings?.forum_enabled) {
    return res.status(403).json({
      success: false,
      message: 'Forum feature is currently disabled'
    });
  }

  // Check if user is banned
  if (await checkForumBan(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: 'You are banned from participating in the forum'
    });
  }

  const comment = await ForumComment.findByPk(req.params.id, {
    include: [
      {
        model: ForumThread,
        as: 'thread',
        attributes: ['id', 'isLocked', 'isBlocked']
      }
    ]
  });

  if (!comment) {
    return res.status(404).json({
      success: false,
      message: 'Comment not found'
    });
  }

  // Check permissions
  if (!comment.canBeEditedBy(req.user)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to edit this comment'
    });
  }

  // Check if thread allows editing
  if (comment.thread.isLocked || comment.thread.isBlocked) {
    return res.status(403).json({
      success: false,
      message: 'Cannot edit comments in a locked or blocked thread'
    });
  }

  const { content } = req.body;

  await comment.update({ content });

  const updatedComment = await ForumComment.findByPk(comment.id, {
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'avatar']
      },
      {
        model: ForumComment,
        as: 'parentComment',
        attributes: ['id', 'content'],
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username']
          }
        ]
      }
    ]
  });

  res.json({
    success: true,
    data: updatedComment
  });
});

// @desc    Delete a comment
// @route   DELETE /api/forum/comments/:id
// @access  Owner/Admin
exports.deleteComment = asyncHandler(async (req, res) => {
  // Check if forum is enabled
  const settings = await SiteSettings.findOne();
  if (!settings?.forum_enabled) {
    return res.status(403).json({
      success: false,
      message: 'Forum feature is currently disabled'
    });
  }

  const comment = await ForumComment.findByPk(req.params.id);

  if (!comment) {
    return res.status(404).json({
      success: false,
      message: 'Comment not found'
    });
  }

  // Check permissions
  if (!comment.canBeDeletedBy(req.user)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to delete this comment'
    });
  }

  await comment.destroy();

  res.json({
    success: true,
    message: 'Comment deleted successfully'
  });
});
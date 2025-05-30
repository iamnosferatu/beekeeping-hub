// backend/src/controllers/contactController.js
const { Contact } = require("../models");
const { Op } = require("sequelize");

/**
 * Submit a contact form message
 * @route   POST /api/contact
 * @access  Public
 */
exports.submitContactForm = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // Get IP address and user agent
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.get('User-Agent');

    // Create contact message
    const contactMessage = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      ip_address,
      user_agent,
    });

    // In a real application, you might want to:
    // 1. Send an email notification to admin
    // 2. Send a confirmation email to the user
    // 3. Integrate with a CRM or ticketing system

    res.status(201).json({
      success: true,
      message: "Your message has been received. We'll get back to you soon.",
      data: {
        id: contactMessage.id,
        name: contactMessage.name,
        email: contactMessage.email,
        subject: contactMessage.subject,
      },
    });
  } catch (error) {
    console.error("Contact form submission error:", error);
    
    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message,
      }));
      
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    next(error);
  }
};

/**
 * Get all contact messages (Admin only)
 * @route   GET /api/admin/contacts
 * @access  Private (Admin only)
 */
exports.getContactMessages = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const where = {};
    
    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { subject: { [Op.like]: `%${search}%` } },
        { message: { [Op.like]: `%${search}%` } },
      ];
    }

    // Get contact messages with pagination
    const { count, rows: contacts } = await Contact.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]],
      attributes: [
        "id",
        "name",
        "email",
        "subject",
        "message",
        "status",
        "created_at",
        "updated_at",
      ],
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      data: contacts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    next(error);
  }
};

/**
 * Get a single contact message (Admin only)
 * @route   GET /api/admin/contacts/:id
 * @access  Private (Admin only)
 */
exports.getContactMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByPk(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    // Mark as read if it was new
    if (contact.status === "new") {
      await contact.update({ status: "read" });
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("Error fetching contact message:", error);
    next(error);
  }
};

/**
 * Update contact message status (Admin only)
 * @route   PUT /api/admin/contacts/:id/status
 * @access  Private (Admin only)
 */
exports.updateContactStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["new", "read", "replied", "archived"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const contact = await Contact.findByPk(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    await contact.update({ status });

    res.status(200).json({
      success: true,
      message: "Contact message status updated",
      data: {
        id: contact.id,
        status: contact.status,
      },
    });
  } catch (error) {
    console.error("Error updating contact status:", error);
    next(error);
  }
};

/**
 * Delete contact message (Admin only)
 * @route   DELETE /api/admin/contacts/:id
 * @access  Private (Admin only)
 */
exports.deleteContactMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByPk(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    await contact.destroy();

    res.status(200).json({
      success: true,
      message: "Contact message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting contact message:", error);
    next(error);
  }
};

/**
 * Get contact statistics (Admin only)
 * @route   GET /api/admin/contacts/stats
 * @access  Private (Admin only)
 */
exports.getContactStats = async (req, res, next) => {
  try {
    const stats = await Contact.findAll({
      attributes: [
        "status",
        [Contact.sequelize.fn("COUNT", Contact.sequelize.col("id")), "count"],
      ],
      group: ["status"],
    });

    const totalMessages = await Contact.count();
    const todayMessages = await Contact.count({
      where: {
        created_at: {
          [Op.gte]: new Date().setHours(0, 0, 0, 0),
        },
      },
    });

    const formattedStats = {
      total: totalMessages,
      today: todayMessages,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat.status] = parseInt(stat.get("count"));
        return acc;
      }, {}),
    };

    res.status(200).json({
      success: true,
      data: formattedStats,
    });
  } catch (error) {
    console.error("Error fetching contact stats:", error);
    next(error);
  }
};
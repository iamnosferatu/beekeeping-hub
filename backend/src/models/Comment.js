// backend/src/models/Comment.js
module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define("Comment", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Comment content cannot be empty",
        },
        len: {
          args: [1, 5000],
          msg: "Comment must be between 1 and 5000 characters",
        },
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    ip_address: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    // Foreign key for the parent comment (for nested comments)
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "comments",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    // Foreign keys for user and article are added via associations
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    article_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "articles",
        key: "id",
      },
    },
    // Comment reporting fields
    reported: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    report_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reported_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    reported_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  return Comment;
};

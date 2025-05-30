// backend/src/models/Contact.js
module.exports = (sequelize, DataTypes) => {
  const Contact = sequelize.define(
    "Contact",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Name is required",
          },
          len: {
            args: [2, 100],
            msg: "Name must be between 2 and 100 characters",
          },
        },
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Email is required",
          },
          isEmail: {
            msg: "Please provide a valid email address",
          },
        },
      },
      subject: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Subject is required",
          },
          len: {
            args: [5, 200],
            msg: "Subject must be between 5 and 200 characters",
          },
        },
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Message is required",
          },
          len: {
            args: [10, 5000],
            msg: "Message must be between 10 and 5000 characters",
          },
        },
      },
      status: {
        type: DataTypes.ENUM("new", "read", "replied", "archived"),
        defaultValue: "new",
      },
      ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "contact_messages",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["email"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["created_at"],
        },
      ],
    }
  );

  return Contact;
};
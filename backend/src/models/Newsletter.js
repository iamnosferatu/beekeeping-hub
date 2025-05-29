// backend/src/models/Newsletter.js
module.exports = (sequelize, DataTypes) => {
  const Newsletter = sequelize.define(
    "Newsletter",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: "Please provide a valid email address",
          },
        },
      },
      status: {
        type: DataTypes.ENUM("active", "unsubscribed"),
        defaultValue: "active",
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Unsubscribe token",
      },
      subscribed_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      unsubscribed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
    },
    {
      tableName: "newsletter_subscribers",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["email"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["token"],
        },
      ],
    }
  );

  return Newsletter;
};
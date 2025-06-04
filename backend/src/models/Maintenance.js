// backend/src/models/Maintenance.js
module.exports = (sequelize, DataTypes) => {
  const Maintenance = sequelize.define("Maintenance", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Maintenance mode settings
    maintenance_mode: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    maintenance_title: {
      type: DataTypes.STRING(255),
      defaultValue: "Site Under Maintenance",
      allowNull: false,
    },
    maintenance_message: {
      type: DataTypes.TEXT,
      defaultValue:
        "We're currently performing scheduled maintenance. We'll be back online shortly. Thank you for your patience!",
      allowNull: false,
    },
    maintenance_estimated_time: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Estimated time when maintenance will be complete",
    },
    // Alert banner settings
    alert_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    alert_type: {
      type: DataTypes.ENUM("info", "warning", "success", "danger"),
      defaultValue: "info",
      allowNull: false,
    },
    alert_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    alert_dismissible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment: "Whether users can dismiss the alert",
    },
    alert_link_text: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Optional link text for the alert",
    },
    alert_link_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Optional link URL for the alert",
    },
    // Tracking who made changes
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
  }, {
    tableName: 'maintenance',
    underscored: true,
    timestamps: true
  });

  return Maintenance;
};
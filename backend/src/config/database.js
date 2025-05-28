// backend/src/config/database.js
const { Sequelize } = require("sequelize");
require("dotenv").config();

// Log configuration for debugging
console.log("Database configuration:");
console.log("DB_HOST:", process.env.DB_HOST || "localhost");
console.log("DB_NAME:", process.env.DB_NAME || "beekeeper_db");
console.log("DB_USER:", process.env.DB_USER || "root");

// Create Sequelize instance with fallback values
const sequelize = new Sequelize(
  process.env.DB_NAME || "beekeeper_db",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "deadfred",
  {
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Test connection with retries
const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sequelize.authenticate();
      console.log("Database connection established successfully.");
      return true;
    } catch (err) {
      console.error(
        `Connection attempt ${attempt}/${retries} failed:`,
        err.message
      );

      if (attempt < retries) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error("Failed to connect to database after multiple attempts.");
        throw err;
      }
    }
  }
};

module.exports = { sequelize, connectWithRetry };

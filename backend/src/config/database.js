// backend/config/database.js
// Unified database configuration for all environments
require("dotenv").config();

const config = {
  development: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "deadfred",
    database: process.env.DB_NAME || "beekeeper_db",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql",
    logging: console.log,
    define: {
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  test: {
    username: process.env.TEST_DB_USER || "root",
    password: process.env.TEST_DB_PASSWORD || "deadfred",
    database: process.env.TEST_DB_NAME || "beekeeper_test",
    host: process.env.TEST_DB_HOST || "127.0.0.1",
    dialect: "mysql",
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};

module.exports = config;

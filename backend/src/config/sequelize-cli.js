// backend/src/config/sequelize-cli.js
require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER || "beekeeper",
    password: process.env.DB_PASSWORD || "honeypassword",
    database: process.env.DB_NAME || "beekeeper_db",
    host: process.env.DB_HOST || "db",
    dialect: "mysql",
    seederStorage: "sequelize",
    logging: console.log,
  },
  test: {
    username: process.env.TEST_DB_USER || "beekeeper",
    password: process.env.TEST_DB_PASSWORD || "honeypassword",
    database: process.env.TEST_DB_NAME || "beekeeper_test",
    host: process.env.TEST_DB_HOST || "localhost",
    dialect: "mysql",
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};

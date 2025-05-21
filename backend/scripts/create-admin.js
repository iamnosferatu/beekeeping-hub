// scripts/create-admin.js
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sequelize, User } = require("../src/models");

async function createAdminUser() {
  try {
    console.log("Connecting to database...");
    await sequelize.authenticate();
    console.log("Connection established successfully.");

    // Check if admin user already exists
    const adminExists = await User.findOne({
      where: {
        email: "admin@example.com",
      },
    });

    if (adminExists) {
      console.log("Admin user already exists!");
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = await User.create({
      username: "admin",
      email: "admin@example.com",
      password: hashedPassword,
      first_name: "Admin",
      last_name: "User",
      role: "admin",
      is_active: true,
      last_login: new Date(),
    });

    console.log(`Admin user created with ID: ${admin.id}`);
    console.log("Email: admin@example.com");
    console.log("Password: admin123");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log("Database connection closed.");
    process.exit(0);
  }
}

// Run the function
createAdminUser();

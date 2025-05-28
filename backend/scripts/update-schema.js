// backend/src/scripts/update-schema.js
const { sequelize } = require("../models");

/**
 * Update database schema to add blocked fields to Articles table
 */
async function updateSchema() {
  try {
    console.log("🔄 Updating database schema...");

    // Connect to database
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // Add blocked fields to Articles table if they don't exist
    const queryInterface = sequelize.getQueryInterface();
    const tableInfo = await queryInterface.describeTable("Articles");

    let fieldsAdded = 0;

    // Add blocked field if it doesn't exist
    if (!tableInfo.blocked) {
      console.log("Adding 'blocked' field to Articles table...");
      await queryInterface.addColumn("Articles", "blocked", {
        type: sequelize.Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      });
      fieldsAdded++;
    }

    // Add blocked_reason field if it doesn't exist
    if (!tableInfo.blocked_reason) {
      console.log("Adding 'blocked_reason' field to Articles table...");
      await queryInterface.addColumn("Articles", "blocked_reason", {
        type: sequelize.Sequelize.TEXT,
        allowNull: true,
      });
      fieldsAdded++;
    }

    // Add blocked_by field if it doesn't exist
    if (!tableInfo.blocked_by) {
      console.log("Adding 'blocked_by' field to Articles table...");
      await queryInterface.addColumn("Articles", "blocked_by", {
        type: sequelize.Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
      fieldsAdded++;
    }

    // Add blocked_at field if it doesn't exist
    if (!tableInfo.blocked_at) {
      console.log("Adding 'blocked_at' field to Articles table...");
      await queryInterface.addColumn("Articles", "blocked_at", {
        type: sequelize.Sequelize.DATE,
        allowNull: true,
      });
      fieldsAdded++;
    }

    if (fieldsAdded > 0) {
      console.log(`✅ Added ${fieldsAdded} fields to Articles table`);
    } else {
      console.log("✅ All required fields already exist");
    }

    console.log("✅ Schema update completed successfully!");
  } catch (error) {
    console.error("❌ Error updating schema:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the update if this file is executed directly
if (require.main === module) {
  updateSchema();
}

module.exports = updateSchema;

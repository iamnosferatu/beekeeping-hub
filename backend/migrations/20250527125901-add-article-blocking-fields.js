// backend/src/migrations/[timestamp]-add-article-blocking-fields.js
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add blocked field
    await queryInterface.addColumn("articles", "blocked", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });

    // Add blocked_reason field
    await queryInterface.addColumn("articles", "blocked_reason", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // Add blocked_by field
    await queryInterface.addColumn("articles", "blocked_by", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // Add blocked_at field
    await queryInterface.addColumn("articles", "blocked_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Add index on blocked field for faster queries
    await queryInterface.addIndex("articles", ["blocked"], {
      name: "articles_blocked_index",
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index
    await queryInterface.removeIndex("articles", "articles_blocked_index");

    // Remove columns
    await queryInterface.removeColumn("articles", "blocked");
    await queryInterface.removeColumn("articles", "blocked_reason");
    await queryInterface.removeColumn("articles", "blocked_by");
    await queryInterface.removeColumn("articles", "blocked_at");
  },
};

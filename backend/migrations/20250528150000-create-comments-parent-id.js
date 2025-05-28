"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if parent_id column exists
    const tableInfo = await queryInterface.describeTable("comments");

    if (!tableInfo.parent_id) {
      // Add parent_id column
      await queryInterface.addColumn("comments", "parent_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "comments",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      });

      // Add index for better performance
      await queryInterface.addIndex("comments", ["parent_id"], {
        name: "comments_parent_id_index",
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Check if index exists before removing
    const indexes = await queryInterface.showIndex("comments");
    const indexExists = indexes.some(
      (index) => index.name === "comments_parent_id_index"
    );

    if (indexExists) {
      await queryInterface.removeIndex("comments", "comments_parent_id_index");
    }

    // Remove column if it exists
    const tableInfo = await queryInterface.describeTable("comments");
    if (tableInfo.parent_id) {
      await queryInterface.removeColumn("comments", "parent_id");
    }
  },
};

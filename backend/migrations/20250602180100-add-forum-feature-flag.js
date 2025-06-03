'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add forum_enabled column to site_settings table
    await queryInterface.addColumn('site_settings', 'forum_enabled', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove forum_enabled column
    await queryInterface.removeColumn('site_settings', 'forum_enabled');
  }
};
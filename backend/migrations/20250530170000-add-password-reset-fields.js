'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add password reset fields
    await queryInterface.addColumn('users', 'password_reset_token', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await queryInterface.addColumn('users', 'password_reset_expires', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Add index for faster token lookups
    await queryInterface.addIndex('users', ['password_reset_token']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('users', ['password_reset_token']);
    await queryInterface.removeColumn('users', 'password_reset_expires');
    await queryInterface.removeColumn('users', 'password_reset_token');
  }
};
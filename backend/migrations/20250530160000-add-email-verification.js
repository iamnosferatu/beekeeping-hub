'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add email verification fields
    await queryInterface.addColumn('users', 'email_verified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });

    await queryInterface.addColumn('users', 'email_verification_token', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await queryInterface.addColumn('users', 'email_verification_expires', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Add index for faster token lookups
    await queryInterface.addIndex('users', ['email_verification_token']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('users', ['email_verification_token']);
    await queryInterface.removeColumn('users', 'email_verification_expires');
    await queryInterface.removeColumn('users', 'email_verification_token');
    await queryInterface.removeColumn('users', 'email_verified');
  }
};
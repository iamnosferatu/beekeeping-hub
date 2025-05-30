'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('articles', 'content', {
      type: Sequelize.TEXT('long'),
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('articles', 'content', {
      type: Sequelize.TEXT,
      allowNull: false
    });
  }
};
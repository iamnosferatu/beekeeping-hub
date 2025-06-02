'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table exists
    const tableExists = await queryInterface.sequelize.query(
      "SHOW TABLES LIKE 'contact_messages'",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (tableExists.length === 0) {
      await queryInterface.createTable('contact_messages', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        subject: {
          type: Sequelize.STRING(200),
          allowNull: false,
        },
        message: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        status: {
          type: Sequelize.ENUM('new', 'read', 'replied', 'archived'),
          defaultValue: 'new',
          allowNull: false,
        },
        ip_address: {
          type: Sequelize.STRING(45),
          allowNull: true,
        },
        user_agent: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
      });

      // Add indexes
      await queryInterface.addIndex('contact_messages', ['email']);
      await queryInterface.addIndex('contact_messages', ['status']);
      await queryInterface.addIndex('contact_messages', ['created_at']);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('contact_messages');
  },
};
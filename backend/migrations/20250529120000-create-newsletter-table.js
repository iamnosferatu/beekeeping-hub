'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('newsletter_subscribers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      status: {
        type: Sequelize.ENUM('active', 'unsubscribed'),
        defaultValue: 'active',
        allowNull: false
      },
      token: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Unsubscribe token'
      },
      subscribed_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      unsubscribed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('newsletter_subscribers', ['email'], {
      unique: true,
      name: 'newsletter_subscribers_email_unique'
    });
    
    await queryInterface.addIndex('newsletter_subscribers', ['status'], {
      name: 'newsletter_subscribers_status_idx'
    });
    
    await queryInterface.addIndex('newsletter_subscribers', ['token'], {
      name: 'newsletter_subscribers_token_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('newsletter_subscribers');
  }
};
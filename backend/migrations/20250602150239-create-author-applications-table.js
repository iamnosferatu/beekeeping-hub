'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('author_applications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      application_text: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'User\'s application explaining why they want to become an author'
      },
      writing_experience: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'User\'s previous writing experience'
      },
      beekeeping_experience: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'User\'s beekeeping knowledge and experience'
      },
      topics_of_interest: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Topics the user would like to write about'
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
      },
      admin_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Admin comments about the application'
      },
      reviewed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Admin user who reviewed the application'
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('author_applications', ['user_id']);
    await queryInterface.addIndex('author_applications', ['status']);
    await queryInterface.addIndex('author_applications', ['reviewed_by']);
    await queryInterface.addIndex('author_applications', ['createdAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('author_applications');
  }
};
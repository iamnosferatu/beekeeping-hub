'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if columns exist before adding them
    const tableInfo = await queryInterface.describeTable('comments');
    
    // Add reported field if it doesn't exist
    if (!tableInfo.reported) {
      await queryInterface.addColumn('comments', 'reported', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'Whether this comment has been reported'
      });
    }

    // Add report_reason field if it doesn't exist
    if (!tableInfo.report_reason) {
      await queryInterface.addColumn('comments', 'report_reason', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Reason provided when reporting this comment'
      });
    }

    // Add reported_by field if it doesn't exist
    if (!tableInfo.reported_by) {
      await queryInterface.addColumn('comments', 'reported_by', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'User who reported this comment'
      });
    }

    // Add reported_at field if it doesn't exist
    if (!tableInfo.reported_at) {
      await queryInterface.addColumn('comments', 'reported_at', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When the comment was reported'
      });
    }

    // Add indexes for better performance
    if (!tableInfo.reported) {
      await queryInterface.addIndex('comments', ['reported']);
    }
    if (!tableInfo.reported_by) {
      await queryInterface.addIndex('comments', ['reported_by']);
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes
    await queryInterface.removeIndex('comments', ['reported']);
    await queryInterface.removeIndex('comments', ['reported_by']);
    
    // Remove columns
    await queryInterface.removeColumn('comments', 'reported');
    await queryInterface.removeColumn('comments', 'report_reason');
    await queryInterface.removeColumn('comments', 'reported_by');
    await queryInterface.removeColumn('comments', 'reported_at');
  }
};
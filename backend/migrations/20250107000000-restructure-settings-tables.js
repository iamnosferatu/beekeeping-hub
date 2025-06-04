'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create the new features table
    await queryInterface.createTable('features', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      last_modified: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      }
    });

    // 2. Add index on name for faster lookups
    await queryInterface.addIndex('features', ['name']);

    // 3. Get current forum_enabled value from site_settings
    const [settings] = await queryInterface.sequelize.query(
      'SELECT forum_enabled FROM site_settings LIMIT 1'
    );
    
    const forumEnabled = settings && settings[0] ? settings[0].forum_enabled : false;

    // 4. Insert initial feature flags
    await queryInterface.bulkInsert('features', [
      {
        name: 'forum',
        enabled: forumEnabled,
        last_modified: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 5. Rename site_settings table to maintenance
    await queryInterface.renameTable('site_settings', 'maintenance');

    // 6. Remove forum_enabled column from maintenance table
    await queryInterface.removeColumn('maintenance', 'forum_enabled');
  },

  down: async (queryInterface, Sequelize) => {
    // 1. Get current forum enabled state
    const [features] = await queryInterface.sequelize.query(
      "SELECT enabled FROM features WHERE name = 'forum' LIMIT 1"
    );
    
    const forumEnabled = features && features[0] ? features[0].enabled : false;

    // 2. Rename maintenance table back to site_settings
    await queryInterface.renameTable('maintenance', 'site_settings');

    // 3. Add forum_enabled column back to site_settings
    await queryInterface.addColumn('site_settings', 'forum_enabled', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });

    // 4. Update forum_enabled value
    await queryInterface.sequelize.query(
      `UPDATE site_settings SET forum_enabled = ${forumEnabled}`
    );

    // 5. Remove index from features table
    await queryInterface.removeIndex('features', ['name']);

    // 6. Drop features table
    await queryInterface.dropTable('features');
  }
};
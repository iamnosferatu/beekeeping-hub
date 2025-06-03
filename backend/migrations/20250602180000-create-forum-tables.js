'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create forum_categories table
    await queryInterface.createTable('forum_categories', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
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
      is_blocked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      blocked_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      blocked_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      blocked_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create forum_threads table
    await queryInterface.createTable('forum_threads', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(300),
        allowNull: false,
        unique: true
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'forum_categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      is_pinned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_locked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_blocked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      blocked_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      blocked_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      blocked_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      view_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      last_activity_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create forum_comments table
    await queryInterface.createTable('forum_comments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      thread_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'forum_threads',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      parent_comment_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'forum_comments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      is_blocked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      blocked_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      blocked_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      blocked_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create user_forum_bans table
    await queryInterface.createTable('user_forum_bans', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      banned_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      banned_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('forum_categories', ['slug']);
    await queryInterface.addIndex('forum_categories', ['user_id']);
    await queryInterface.addIndex('forum_categories', ['is_blocked']);
    
    await queryInterface.addIndex('forum_threads', ['slug']);
    await queryInterface.addIndex('forum_threads', ['category_id']);
    await queryInterface.addIndex('forum_threads', ['user_id']);
    await queryInterface.addIndex('forum_threads', ['is_blocked']);
    await queryInterface.addIndex('forum_threads', ['last_activity_at']);
    
    await queryInterface.addIndex('forum_comments', ['thread_id']);
    await queryInterface.addIndex('forum_comments', ['user_id']);
    await queryInterface.addIndex('forum_comments', ['parent_comment_id']);
    await queryInterface.addIndex('forum_comments', ['is_blocked']);
    
    await queryInterface.addIndex('user_forum_bans', ['user_id']);
    await queryInterface.addIndex('user_forum_bans', ['expires_at']);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order of dependencies
    await queryInterface.dropTable('user_forum_bans');
    await queryInterface.dropTable('forum_comments');
    await queryInterface.dropTable('forum_threads');
    await queryInterface.dropTable('forum_categories');
  }
};
const { SiteSettings } = require('../src/models');
const { sequelize } = require('../src/models');

async function enableForum() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    
    // Find or create site settings
    const [settings] = await SiteSettings.findOrCreate({
      where: { id: 1 },
      defaults: {
        maintenance_mode: false,
        forum_enabled: true
      }
    });
    
    // Update forum_enabled to true
    settings.forum_enabled = true;
    await settings.save();
    
    console.log('✅ Forum feature has been enabled successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error enabling forum:', error.message);
    process.exit(1);
  }
}

enableForum();
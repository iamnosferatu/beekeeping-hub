#!/usr/bin/env node

/**
 * Script to manage feature flags
 * Usage: 
 *   node scripts/manage-features.js list
 *   node scripts/manage-features.js enable <feature-name>
 *   node scripts/manage-features.js disable <feature-name>
 *   node scripts/manage-features.js create <feature-name> [--enabled]
 */

require('dotenv').config();
const { Feature } = require('../src/models');

const command = process.argv[2];
const featureName = process.argv[3];
const flags = process.argv.slice(4);

async function listFeatures() {
  try {
    const features = await Feature.getAllFeatures();
    
    console.log('\n=== Feature Flags ===\n');
    
    if (features.length === 0) {
      console.log('No features configured.');
    } else {
      features.forEach(feature => {
        const status = feature.enabled ? '✅ Enabled' : '❌ Disabled';
        const lastModified = new Date(feature.last_modified).toLocaleString();
        console.log(`${feature.name}: ${status}`);
        console.log(`  Last modified: ${lastModified}\n`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error listing features:', error.message);
    process.exit(1);
  }
}

async function enableFeature(name) {
  try {
    const feature = await Feature.toggleFeature(name, true);
    console.log(`✅ Feature '${name}' has been enabled.`);
    process.exit(0);
  } catch (error) {
    console.error(`Error enabling feature '${name}':`, error.message);
    process.exit(1);
  }
}

async function disableFeature(name) {
  try {
    const feature = await Feature.toggleFeature(name, false);
    console.log(`❌ Feature '${name}' has been disabled.`);
    process.exit(0);
  } catch (error) {
    console.error(`Error disabling feature '${name}':`, error.message);
    process.exit(1);
  }
}

async function createFeature(name, enabled = false) {
  try {
    const feature = await Feature.create({
      name: name.toLowerCase(),
      enabled,
      last_modified: new Date()
    });
    
    const status = enabled ? 'enabled' : 'disabled';
    console.log(`✨ Feature '${name}' has been created and ${status}.`);
    process.exit(0);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.error(`Error: Feature '${name}' already exists.`);
    } else {
      console.error(`Error creating feature '${name}':`, error.message);
    }
    process.exit(1);
  }
}

function showUsage() {
  console.log(`
Feature Management Script

Usage:
  node scripts/manage-features.js list                    - List all features
  node scripts/manage-features.js enable <name>           - Enable a feature
  node scripts/manage-features.js disable <name>          - Disable a feature
  node scripts/manage-features.js create <name> [--enabled] - Create a new feature

Examples:
  node scripts/manage-features.js list
  node scripts/manage-features.js enable forum
  node scripts/manage-features.js disable newsletter
  node scripts/manage-features.js create comments --enabled
`);
}

// Main execution
(async () => {
  if (!command) {
    showUsage();
    process.exit(1);
  }

  switch (command.toLowerCase()) {
    case 'list':
      await listFeatures();
      break;
      
    case 'enable':
      if (!featureName) {
        console.error('Error: Feature name is required.');
        showUsage();
        process.exit(1);
      }
      await enableFeature(featureName);
      break;
      
    case 'disable':
      if (!featureName) {
        console.error('Error: Feature name is required.');
        showUsage();
        process.exit(1);
      }
      await disableFeature(featureName);
      break;
      
    case 'create':
      if (!featureName) {
        console.error('Error: Feature name is required.');
        showUsage();
        process.exit(1);
      }
      const enabled = flags.includes('--enabled');
      await createFeature(featureName, enabled);
      break;
      
    default:
      console.error(`Error: Unknown command '${command}'.`);
      showUsage();
      process.exit(1);
  }
})();
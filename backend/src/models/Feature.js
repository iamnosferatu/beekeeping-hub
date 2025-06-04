// backend/src/models/Feature.js

module.exports = (sequelize, DataTypes) => {
  const Feature = sequelize.define('Feature', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'Feature name is required'
        },
        isLowercase: {
          msg: 'Feature name must be lowercase'
        }
      }
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    last_modified: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  }, {
    tableName: 'features',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        fields: ['name']
      }
    ],
    hooks: {
      beforeUpdate: (feature) => {
        // Update last_modified whenever the feature is updated
        feature.last_modified = new Date();
      }
    }
  });

  // Class methods
  Feature.getFeatureStatus = async function(featureName) {
    const feature = await this.findOne({
      where: { name: featureName }
    });
    return feature ? feature.enabled : false;
  };

  Feature.toggleFeature = async function(featureName, enabled) {
    const [feature, created] = await this.findOrCreate({
      where: { name: featureName },
      defaults: { enabled, last_modified: new Date() }
    });

    if (!created && feature.enabled !== enabled) {
      feature.enabled = enabled;
      feature.last_modified = new Date();
      await feature.save();
    }

    return feature;
  };

  Feature.getAllFeatures = async function() {
    return this.findAll({
      order: [['name', 'ASC']]
    });
  };

  return Feature;
};
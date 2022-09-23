const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Category extends Model {}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
    },
    createdBy: {
      type: DataTypes.STRING(16),
    },
    updatedBy: {
      type: DataTypes.STRING(16),
    },
    name: {
      type: DataTypes.STRING(64),
    },
    description: {
      type: DataTypes.STRING(1024),
    },
    logoImage: {
      type: DataTypes.STRING(48),
    },
    dynamicContent: {
      type: DataTypes.JSON
    },
    position: {
      type: DataTypes.INTEGER
    },
  },
  {
    sequelize,
    schema: 'mv_object_mgmt',
    indexes: [],
    modelName: 'category',
  },
);

export = Category;

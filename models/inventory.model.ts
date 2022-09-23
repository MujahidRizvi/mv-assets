const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Inventory extends Model {}

Inventory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(128),
    },
    cid: {
      type: DataTypes.STRING(128),
    },
    metaData: {
      type: DataTypes.JSON,
    },
    type: {
      type: DataTypes.STRING(16),
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
  },
  {
    sequelize,
    schema: 'mv_object_mgmt',
    indexes: [],
    modelName: 'inventory',
  },
);

export = Inventory;

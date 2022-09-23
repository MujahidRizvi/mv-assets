const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class AssetOwnerHistory extends Model {}

AssetOwnerHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    assetId: {
      type: DataTypes.INTEGER,
    },
    ownerId: {
      type: DataTypes.STRING(128),
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
    modelName: 'asset_owner_history',
  },
);

export = AssetOwnerHistory;

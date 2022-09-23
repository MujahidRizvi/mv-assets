const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Asset extends Model {}

Asset.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    contractId: {
      type: DataTypes.INTEGER,
    },
    ownerId: {
      type: DataTypes.STRING(128),
    },

    assetLocation: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.DECIMAL(7, 4),
    },
    lat: {
      type: DataTypes.DECIMAL(12, 9),
    },
    lon: {
      type: DataTypes.DECIMAL(12, 9),
    },
    assetName: {
      type: DataTypes.STRING(64),
    },
    seasonName: {
      type: DataTypes.STRING(16),
    },
    assetType: {
      type: DataTypes.STRING(16),
    },
    assetStatus: {
      type: DataTypes.STRING(16),
    },
    imageName: {
      type: DataTypes.STRING(64),
    },
    animationName: {
      type: DataTypes.STRING(64),
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
    description: {
      type: DataTypes.STRING(512),
    },
    stickerName: {
      type: DataTypes.STRING(64),
    },
    attributes: {
      type: DataTypes.JSONB,
    },
  },
  {
    sequelize,
    schema: 'mv_object_mgmt',
    indexes: [],
    modelName: 'asset',
  },
);

export = Asset;

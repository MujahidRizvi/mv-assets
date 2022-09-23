const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Contract extends Model {}

Contract.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    seasonName: {
      type: DataTypes.STRING(16),
    },
    assetType: {
      type: DataTypes.STRING(16),
    },
    contractAddress: {
      type: DataTypes.STRING(64),
    },
    contractAbi: {
      type: DataTypes.JSON,
    },
    blockNumber: {
      type: DataTypes.INTEGER,
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
      type: DataTypes.STRING(64),
    },
    featuredImage: {
      type: DataTypes.STRING(64),
    },
    bannerImage: {
      type: DataTypes.STRING(64),
    },
    categoryId: {
      type: DataTypes.INTEGER,
    },
    payoutAddress: {
      type: DataTypes.STRING(48),
    },
    sellerFee: {
      type: DataTypes.DECIMAL(4, 2),
    },
    attributes: {
      type: DataTypes.JSON,
    },
    attributesPanel: {
      type: DataTypes.JSON,
    },
    merkleHash: {
      type: DataTypes.STRING(72),
    },
  },
  {
    sequelize,
    schema: 'mv_object_mgmt',
    indexes: [],
    modelName: 'contract',
  },
);

export = Contract;

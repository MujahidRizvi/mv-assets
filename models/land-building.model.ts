const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class LandBuilding extends Model {}

LandBuilding.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    landId: {
      type: DataTypes.INTEGER,
    },
    buildingId: {
      type: DataTypes.INTEGER,
    },
    buildingElevation: {
      type: DataTypes.DECIMAL,
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
    modelName: 'land_building',
  },
);

export = LandBuilding;

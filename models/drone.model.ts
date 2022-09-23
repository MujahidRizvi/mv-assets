const { DataTypes, Model }=require('sequelize');
const sequelize = require('../config/database');

class Drone extends Model {}

Drone.init(
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
    droneCID: {
      type: DataTypes.STRING(128),
    },
    contractId: {
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
    }
  },
  {
    sequelize,
    schema: 'mv_object_mgmt',
    indexes: [],
    modelName: 'drone',
    initialAutoIncrement: 1000,
  },
);

export = Drone;

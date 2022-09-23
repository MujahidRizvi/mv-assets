const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Lookup extends Model {}

Lookup.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(16),
    },
    key: {
      type: DataTypes.STRING(16),
    },
    value: {
      type: DataTypes.STRING(16),
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    modelName: 'lookup',
  },
);

export = Lookup;

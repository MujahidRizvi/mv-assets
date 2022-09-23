const { DataTypes, Model }=require('sequelize');
const sequelize = require('../config/database');

class AssetType extends Model {}

AssetType.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING(128),
    }
  },
  {
    sequelize,
    schema: 'mv_object_mgmt',
    indexes: [],
    modelName: 'asset_type',
  },
);

export = AssetType;

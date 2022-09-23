const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class WhiteListUser extends Model {}

WhiteListUser.init(
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
    user: {
      type: DataTypes.STRING(128),
    },
  },
  {
    sequelize,
    schema: 'mv_object_mgmt',
    indexes: [],
    modelName: 'whitelist_user',
  },
);

export = WhiteListUser;

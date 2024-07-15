const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Config = sequelize.define('Config', {
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'config',
  timestamps: false,
});

module.exports = Config;

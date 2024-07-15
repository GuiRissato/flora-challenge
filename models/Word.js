const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Word = sequelize.define('Word', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  word: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  timestamps: true,
});

module.exports = Word;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Word = require('./Word');

const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  wordId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Word,
      key: 'id',
    },
  },
}, {
  timestamps: true,
});

module.exports = Favorite;

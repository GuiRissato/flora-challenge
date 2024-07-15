const Sequelize = require('../config/database');
const User = require('./User');
const Word = require('./Word');
const Favorite = require('./Favorite');
const History = require('./History');
const Config = require('./Config')

// Definindo as relações
User.hasMany(Favorite, { foreignKey: 'userId', onDelete: 'CASCADE' });
Favorite.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(History, { foreignKey: 'userId', onDelete: 'CASCADE' });
History.belongsTo(User, { foreignKey: 'userId' });

Word.hasMany(Favorite, { foreignKey: 'wordId', onDelete: 'CASCADE' });
Favorite.belongsTo(Word, { foreignKey: 'wordId' });

Word.hasMany(History, { foreignKey: 'wordId', onDelete: 'CASCADE' });
History.belongsTo(Word, { foreignKey: 'wordId' });

module.exports = {
  Sequelize,
  User,
  Word,
  Favorite,
  History,
  Config
};

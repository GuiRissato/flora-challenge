const { sequelize } = require('./models');

(async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced!');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing database:', error);
    process.exit(1);
  }
})();

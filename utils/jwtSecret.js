const Config = require('../models/Config');

async function getJwtSecret() {
  const config = await Config.findOne({ where: { key: 'jwt_secret' } });
  if (!config) {
    throw new Error('JWT secret not found');
  }
  return config.value;
}

module.exports = getJwtSecret;

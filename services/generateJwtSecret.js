require('dotenv').config();
const crypto = require('crypto');
const { Config } = require('../models'); // Certifique-se de que o caminho está correto

// Gerar JWT Secret
const generateJwtSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Inserir JWT Secret no banco de dados se não existir
const insertJwtSecret = async () => {
  const jwtSecret = generateJwtSecret();
  console.log('Generated JWT Secret:', jwtSecret);

  try {
    const config = await Config.findOne({ where: { key: 'jwt_secret' } });
    if (config) {
      console.log('JWT secret already exists.');
    } else {
      await Config.create({ key: 'jwt_secret', value: jwtSecret });
      console.log('JWT secret inserted successfully.');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = insertJwtSecret;

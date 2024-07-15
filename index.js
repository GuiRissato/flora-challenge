require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs'); 
const { Sequelize } = require('./models/index.js');
const authRoutes = require('./routes/authRoutes');
const wordRoutes = require('./routes/wordRoutes');
const userRoutes = require('./routes/userRoutes');
const insertJwtSecret = require('./services/generateJwtSecret');
const importWordsToDatabase = require('./services/importWords')
const {Word} = require('./models')

const app = express();
const PORT = process.env.PORT || 3000;

const swaggerDocument = YAML.load('./docs/openapi.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware para parsing do corpo das requisições
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rotas
app.use('/auth', authRoutes);
app.use('/entries/en', wordRoutes);
app.use('/user/me', userRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'English Dictionary' });
});


const checkWordsImported = async () => {
  try {
    const count = await Word.count();
    return count === 0;
  } catch (error) {
    console.error('Failed to check if words are imported:', error);
    return false;
  }
};

// Conectar ao banco de dados, inserir JWT secret e iniciar o servidor
(async () => {
  try {
    await Sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    await insertJwtSecret();

    const wordsNotImported = await checkWordsImported();

    if (wordsNotImported) {
      console.log('aqui')
      await importWordsToDatabase();
    }
    
    await Sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
})();

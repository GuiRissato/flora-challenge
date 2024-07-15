// importWords.js
const axios = require('axios');
const { Word } = require('../models'); // Ajuste o caminho conforme necessário

const downloadWords = async () => {
  try {
    const url = 'https://raw.githubusercontent.com/dwyl/english-words/master/words_dictionary.json';
    const response = await axios.get(url);
    const wordsData = response.data;

    const words = Object.keys(wordsData).map(word => ({
      word,
      definition: wordsData[word], // Se houver definição disponível
    }));

    return words;
  } catch (error) {
    console.error('Failed to download words:', error);
    return [];
  }
};

const importWordsToDatabase = async () => {
  try {
    const words = await downloadWords();

    await Word.bulkCreate(words);

    console.log('Imported', words.length, 'words into the database.');

    // Marcar como importado na primeira execução bem-sucedida
    await Word.update({ imported: true }, { where: {} });

  } catch (error) {
    console.error('Failed to import words into the database:', error);
  }
};

module.exports = importWordsToDatabase;

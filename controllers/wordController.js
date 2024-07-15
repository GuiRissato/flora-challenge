const { Op } = require('sequelize');
const { performance } = require('perf_hooks');
const redisClient = require('../services/redisClient');
const { Word, Favorite, History, User } = require('../models');

exports.getWord = async (req, res) => {
  const start = performance.now();
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const cacheKey = `API_${search}_${limit}`;
    const cachedResult = await redisClient.get(cacheKey);

    if (cachedResult) {
      const parsedResult = JSON.parse(cachedResult);
      res.setHeader('x-cache', 'HIT');
      res.setHeader('x-response-time', `${(performance.now() - start).toFixed(3)} ms`);
      return res.status(200).json(parsedResult);
    }

    res.setHeader('x-cache', 'MISS');

    const words = await Word.findAndCountAll({
      where: {
        word: { [Op.iLike]: `%${search}%` }
      },
      limit: limit,
      offset: offset
    });

    const paginatedWords = words.rows.map(word => word.word);

    const result = {
      results: paginatedWords,
      totalDocs: words.count,
      page: parseInt(page),
      totalPages: Math.ceil(words.count / limit),
      hasNext: offset + limit < words.count,
      hasPrev: offset > 0
    };

    if(paginatedWords.length === 0) return res.status(204).json({message: "no data"})

    await redisClient.set(cacheKey, JSON.stringify(result));

    const userId = req.user.id;
    await History.create({ userId, wordId: words.rows[0].id });

    res.setHeader('x-response-time', `${(performance.now() - start).toFixed(3)} ms`);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Failed to fetch words:', error);
    res.setHeader('x-response-time', `${(performance.now() - start).toFixed(3)} ms`);
    return res.status(400).json({ error: 'Failed to fetch words' });
  }
};

exports.saveWord = async (req, res) => {
  const start = performance.now();
  try {
    const { word } = req.params;
    const userId = req.user.id;

    const cacheKey = `WORD_${word}`;
    const cachedResult = await redisClient.get(cacheKey);

    if (cachedResult) {
      const parsedResult = JSON.parse(cachedResult);
      res.setHeader('x-cache', 'HIT');
      res.setHeader('x-response-time', `${(performance.now() - start).toFixed(3)} ms`);
      return res.status(200).json(parsedResult);
    }

    res.setHeader('x-cache', 'MISS');

    let wordRecord = await Word.findOne({ where: { word } });

    if (!wordRecord) {
      return res.status(204).json({ message: 'Word not found' });
    }

    await History.create({
      userId,
      wordId: wordRecord.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const result = { message: 'Word saved to history', word: wordRecord };
    await redisClient.set(cacheKey, JSON.stringify(result));

    res.setHeader('x-response-time', `${(performance.now() - start).toFixed(3)} ms`);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Failed to save word:', error);
    res.setHeader('x-response-time', `${(performance.now() - start).toFixed(3)} ms`);
    return res.status(400).json({ error: 'Failed to save word' });
  }
};

exports.addFavorite = async (req, res) => {
  const start = performance.now();
  try {
    const { word } = req.params;
    const userId = req.user.id;

    const cacheKey = `FAVORITE_${userId}_${word}`;
    const cachedResult = await redisClient.get(cacheKey);

    if (cachedResult) {
      res.setHeader('x-cache', 'HIT');
      res.setHeader('x-response-time', `${(performance.now() - start).toFixed(3)} ms`);
      return res.status(200).json({ message: 'Word already favorited' });
    }

    res.setHeader('x-cache', 'MISS');

    let wordRecord = await Word.findOne({ where: { word } });

    if (!wordRecord) {
      return res.status(204).json({ message: 'Word not found' });
    }

    const existingFavorite = await Favorite.findOne({
      where: { userId, wordId: wordRecord.id }
    });

    if (existingFavorite) {
      await redisClient.set(cacheKey, JSON.stringify({ message: 'Word already favorited' }));
      res.setHeader('x-response-time', `${(performance.now() - start).toFixed(3)} ms`);
      return res.status(400).json({ error: 'Word already favorited' });
    }

    const favorite = await Favorite.create({
      userId,
      wordId: wordRecord.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await redisClient.set(cacheKey, JSON.stringify({ message: 'Favorite word saved' }));

    res.setHeader('x-response-time', `${(performance.now() - start).toFixed(3)} ms`);
    return res.status(200).json({ message: 'Favorite word saved' });
  } catch (error) {
    console.error('Failed to add favorite:', error);
    res.setHeader('x-response-time', `${(performance.now() - start).toFixed(3)} ms`);
    return res.status(400).json({ error: 'Failed to add favorite' });
  }
};

exports.removeFavorite = async (req, res) => {
  const start = performance.now();
  try {
    const { word } = req.params;
    const userId = req.user.id;

    const cacheKey = `FAVORITE_${userId}_${word}`;

    const wordRecord = await Word.findOne({ where: { word } });
    if (!wordRecord) {
      return res.status(204).json({ message: 'Word not found' });
    }

    await Favorite.destroy({ where: { userId, wordId: wordRecord.id } });

    await redisClient.set(cacheKey, JSON.stringify({ message: 'Favorite removed' }));

    res.setHeader('x-response-time', `${(performance.now() - start).toFixed(3)} ms`);
    return res.status(200).json({ message: 'Favorite removed' });
  } catch (error) {
    console.error('Failed to remove favorite:', error);
    res.setHeader('x-response-time', `${(performance.now() - start).toFixed(3)} ms`);
    return res.status(400).json({ error: 'Failed to remove favorite' });
  }
};
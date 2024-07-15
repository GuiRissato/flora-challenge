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

exports.getProfile = async (req, res) => {
  const start = performance.now();
  try {
    const userId = req.user.id;
    const cacheKey = `PROFILE_${userId}`;
    const cachedResult = await redisClient.get(cacheKey);

    if (cachedResult) {
      res.setHeader('x-cache', 'HIT');
      res.setHeader('x-response-time', `${(performance.now() - start).toFixed(3)} ms`);
      return res.status(200).json(JSON.parse(cachedResult));
    }

    res.setHeader('x-cache', 'MISS');
    const user = await User.findByPk(userId, {
      attributes: ['name', 'email']
    });

    if (!user) {
      res.setHeader('x-response-time', `${(performance.now() - start).toFixed(3)} ms`);
      return res.status(204).json({ message: 'User not found' });
    }

    await redisClient.set(cacheKey, JSON.stringify(user));
    res.setHeader('x-response-time', `${(performance.now() - start).toFixed(3)} ms`);
    return res.status(200).json(user);
  } catch (error) {
    console.error('Failed to retrieve user profile:', error);
    res.setHeader('x-response-time', `${(performance.now() - start).toFixed(3)} ms`);
    return res.status(400).json({ error: 'Failed to retrieve user profile' });
  }
};

exports.getHistory = async (req, res) => {
  const start = performance.now();
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const cacheKey = `HISTORY_${userId}_${page}_${limit}`;
    const cachedResult = await redisClient.get(cacheKey);

    if (cachedResult) {
      res.setHeader('x-cache', 'HIT');
      res.setHeader('x-response-time', `${(performance.now() - start).toFixed(3)} ms`);
      return res.status(200).json(JSON.parse(cachedResult));
    }

    res.setHeader('x-cache', 'MISS');
    const { count, rows: history } = await History.findAndCountAll({
      where: { userId },
      attributes: ['createdAt'],
      include: [{ model: Word, attributes: ['word'] }],
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    });

    const totalPages = Math.ceil(count / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    const formattedHistory = history.map(item => ({
      word: item.Word.word,
      added: item.createdAt,
    }));

    if (formattedHistory.length === 0) {
      res.setHeader('x-response-time', `${(performance.now() - start).toFixed(3)} ms`);
      return res.status(204).json({ message: 'No data for History' });
    }

    const result = {
      results: formattedHistory,
      totalDocs: count,
      page: parseInt(page),
      totalPages,
      hasNext,
      hasPrev,
    };

    await redisClient.set(cacheKey, JSON.stringify(result));
    res.setHeader('x-response-time', `${(performance.now() - start).toFixed(3)} ms`);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Failed to retrieve user history:', error);
    res.setHeader('x-response-time', `${(performance.now() - start).toFixed(3)} ms`);
    return res.status(400).json({ error: 'Failed to retrieve user history' });
  }
};

exports.getFavorites = async (req, res) => {
  const start = performance.now();
  try {
    const userId = req.user.id;
    const { limit = 10, cursor } = req.query;
    const cacheKey = `FAVORITES_${userId}_${cursor || 'initial'}_${limit}`;
    const cachedResult = await redisClient.get(cacheKey);

    if (cachedResult) {
      res.setHeader('x-cache', 'HIT');
      res.setHeader('x-response-time', `${(performance.now() - start).toFixed(3)} ms`);
      return res.status(200).json(JSON.parse(cachedResult));
    }

    res.setHeader('x-cache', 'MISS');

    let whereCondition = { userId };
    if (cursor) {
      whereCondition.createdAt = { [Op.lt]: cursor };
    }

    const favorites = await Favorite.findAll({
      where: whereCondition,
      attributes: ['createdAt'],
      include: [{ model: Word, attributes: ['word'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
    });

    const formattedFavorites = favorites.map(item => ({
      word: item.Word.word,
      added: item.createdAt,
    }));

    if (formattedFavorites.length === 0) {
      res.setHeader('x-response-time', `${(performance.now() - start).toFixed(3)} ms`);
      return res.status(204).json({ message: 'No data for favorites' });
    }

    const lastItem = formattedFavorites[formattedFavorites.length - 1];
    const nextCursor = lastItem.added;

    const result = {
      results: formattedFavorites,
      nextCursor,
      hasNext: formattedFavorites.length === parseInt(limit),
    };

    await redisClient.set(cacheKey, JSON.stringify(result));
    res.setHeader('x-response-time', `${(performance.now() - start).toFixed(3)} ms`);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Failed to retrieve user favorites:', error);
    res.setHeader('x-response-time', `${(performance.now() - start).toFixed(3)} ms`);
    return res.status(400).json({ error: 'Failed to retrieve user favorites' });
  }
};


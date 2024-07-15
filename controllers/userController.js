const { User, Favorite, History, Word } = require('../models');
const redisClient = require('../services/redisClient');
const { performance } = require('perf_hooks');

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
      return res.status(204).json({ error: 'User not found' });
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

    if (!formattedHistory.length) {
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
    const { page = 1, limit = 10 } = req.query;
    const cacheKey = `FAVORITES_${userId}_${page}_${limit}`;
    const cachedResult = await redisClient.get(cacheKey);

    if (cachedResult) {
      res.setHeader('x-cache', 'HIT');
      res.setHeader('x-response-time', `${(performance.now() - start).toFixed(3)} ms`);
      return res.status(200).json(JSON.parse(cachedResult));
    }

    res.setHeader('x-cache', 'MISS');
    const { count, rows: favorites } = await Favorite.findAndCountAll({
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
    const formattedFavorites = favorites.map(item => ({
      word: item.Word.word,
      added: item.createdAt,
    }));

    if (!formattedFavorites.length) {
      res.setHeader('x-response-time', `${(performance.now() - start).toFixed(3)} ms`);
      return res.status(204).json({ message: 'No data for favorites' });
    }

    const result = {
      results: formattedFavorites,
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
    console.error('Failed to retrieve user favorites:', error);
    res.setHeader('x-response-time', `${(performance.now() - start).toFixed(3)} ms`);
    return res.status(400).json({ error: 'Failed to retrieve user favorites' });
  }
};

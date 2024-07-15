const { getAsync, setAsync } = require('../services/redisClient');

const cacheMiddleware = async (req, res, next) => {
  const { search = '', limit = 10 } = req.query;
  const cacheKey = `API_${search}_${limit}`;

  try {
    const cachedResult = await getAsync(cacheKey);

    if (cachedResult) {
      res.setHeader('x-cache', 'HIT');
      res.setHeader('x-response-time', 'cached');
      return res.status(200).json(JSON.parse(cachedResult));
    }

    res.setHeader('x-cache', 'MISS');

    // Chamar a próxima função no pipeline se não houver cache
    next();
  } catch (error) {
    console.error('Error retrieving cache:', error);
    next();
  }
};

module.exports = cacheMiddleware;

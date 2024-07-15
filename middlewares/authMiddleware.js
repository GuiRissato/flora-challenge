const jwt = require('jsonwebtoken');
const getJwtSecret = require('../utils/jwtSecret');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  const jwtSecret = await getJwtSecret();

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Please authenticate.' });
  }
};

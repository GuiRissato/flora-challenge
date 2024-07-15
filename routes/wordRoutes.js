const express = require('express');
const router = express.Router();
const wordController = require('../controllers/wordController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('', authMiddleware, wordController.getWord);
router.get('/:word', authMiddleware,wordController.saveWord);
router.post('/:word/favorites', authMiddleware, wordController.addFavorite);
router.delete('/:word/unfavorite', authMiddleware, wordController.removeFavorite);

module.exports = router;


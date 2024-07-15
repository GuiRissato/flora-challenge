const express = require('express');
const userController = require('../controllers/userController')
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('',authMiddleware, userController.getProfile);
router.get('/history', authMiddleware, userController.getHistory);
router.get('/favorites',authMiddleware, userController.getFavorites);

module.exports = router;

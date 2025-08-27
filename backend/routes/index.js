const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

// Homepage
router.get('/', pageController.homePage);

// Newsletter subscription
router.post('/newsletter', pageController.newsletter);

module.exports = router;

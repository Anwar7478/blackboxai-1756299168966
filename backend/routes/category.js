const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// List all categories
router.get('/', categoryController.listCategories);

// Get top categories (API endpoint)
router.get('/top', categoryController.getTopCategories);

// Category products
router.get('/:id', categoryController.categoryProducts);

module.exports = router;

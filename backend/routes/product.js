const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// List all products
router.get('/', productController.listProducts);

// Get featured products (API endpoint)
router.get('/featured', productController.getFeatured);

// Get new products (API endpoint)
router.get('/new', productController.getNew);

// Single product details
router.get('/:id', productController.productDetails);

module.exports = router;

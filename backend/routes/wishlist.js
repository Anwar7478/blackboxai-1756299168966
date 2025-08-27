const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// View wishlist
router.get('/', (req, res) => {
  const wishlist = req.session.wishlist || [];
  res.render('wishlist', {
    title: 'My Wishlist - Heriken',
    wishlist
  });
});

// Add to wishlist
router.post('/add', async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    // Get product details
    const product = await Product.getById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Initialize wishlist if not exists
    if (!req.session.wishlist) {
      req.session.wishlist = [];
    }
    
    // Check if product already in wishlist
    const existingItem = req.session.wishlist.find(item => item.id == productId);
    
    if (existingItem) {
      return res.json({
        success: false,
        message: 'Product already in wishlist'
      });
    }
    
    // Add to wishlist
    req.session.wishlist.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      addedAt: new Date()
    });
    
    res.json({
      success: true,
      message: 'Product added to wishlist',
      wishlistCount: req.session.wishlist.length
    });
    
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to wishlist'
    });
  }
});

// Remove from wishlist
router.post('/remove', (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    if (!req.session.wishlist) {
      return res.status(400).json({
        success: false,
        message: 'Wishlist is empty'
      });
    }
    
    const itemIndex = req.session.wishlist.findIndex(item => item.id == productId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in wishlist'
      });
    }
    
    req.session.wishlist.splice(itemIndex, 1);
    
    res.json({
      success: true,
      message: 'Product removed from wishlist',
      wishlistCount: req.session.wishlist.length
    });
    
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove product from wishlist'
    });
  }
});

// Move to cart
router.post('/move-to-cart', async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    if (!req.session.wishlist) {
      return res.status(400).json({
        success: false,
        message: 'Wishlist is empty'
      });
    }
    
    const itemIndex = req.session.wishlist.findIndex(item => item.id == productId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in wishlist'
      });
    }
    
    const wishlistItem = req.session.wishlist[itemIndex];
    
    // Initialize cart if not exists
    if (!req.session.cart) {
      req.session.cart = [];
    }
    
    // Check if product already in cart
    const existingCartItem = req.session.cart.find(item => item.id == productId);
    
    if (existingCartItem) {
      existingCartItem.quantity += 1;
    } else {
      // Add to cart
      req.session.cart.push({
        id: wishlistItem.id,
        name: wishlistItem.name,
        price: wishlistItem.price,
        image: wishlistItem.image,
        quantity: 1
      });
    }
    
    // Remove from wishlist
    req.session.wishlist.splice(itemIndex, 1);
    
    res.json({
      success: true,
      message: 'Product moved to cart',
      cartCount: req.session.cart.length,
      wishlistCount: req.session.wishlist.length
    });
    
  } catch (error) {
    console.error('Move to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to move product to cart'
    });
  }
});

// Clear wishlist
router.post('/clear', (req, res) => {
  try {
    req.session.wishlist = [];
    
    res.json({
      success: true,
      message: 'Wishlist cleared successfully',
      wishlistCount: 0
    });
    
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear wishlist'
    });
  }
});

module.exports = router;

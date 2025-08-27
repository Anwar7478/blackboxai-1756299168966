const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// View cart
router.get('/', (req, res) => {
  const cart = req.session.cart || [];
  res.render('cart', {
    title: 'Shopping Cart - Heriken',
    cart
  });
});

// Add to cart
router.post('/add', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
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
    
    // Initialize cart if not exists
    if (!req.session.cart) {
      req.session.cart = [];
    }
    
    // Check if product already in cart
    const existingItemIndex = req.session.cart.findIndex(item => item.id == productId);
    
    if (existingItemIndex > -1) {
      // Update quantity
      req.session.cart[existingItemIndex].quantity += parseInt(quantity);
    } else {
      // Add new item
      req.session.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: parseInt(quantity)
      });
    }
    
    res.json({
      success: true,
      message: 'Product added to cart',
      cartCount: req.session.cart.length
    });
    
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to cart'
    });
  }
});

// Update cart item quantity
router.post('/update', (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId || !quantity || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID or quantity'
      });
    }
    
    if (!req.session.cart) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    const itemIndex = req.session.cart.findIndex(item => item.id == productId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart'
      });
    }
    
    if (quantity === 0) {
      // Remove item
      req.session.cart.splice(itemIndex, 1);
    } else {
      // Update quantity
      req.session.cart[itemIndex].quantity = parseInt(quantity);
    }
    
    res.json({
      success: true,
      message: 'Cart updated successfully',
      cartCount: req.session.cart.length
    });
    
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart'
    });
  }
});

// Remove from cart
router.post('/remove', (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    if (!req.session.cart) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    const itemIndex = req.session.cart.findIndex(item => item.id == productId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart'
      });
    }
    
    req.session.cart.splice(itemIndex, 1);
    
    res.json({
      success: true,
      message: 'Product removed from cart',
      cartCount: req.session.cart.length
    });
    
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove product from cart'
    });
  }
});

// Clear cart
router.post('/clear', (req, res) => {
  try {
    req.session.cart = [];
    
    res.json({
      success: true,
      message: 'Cart cleared successfully',
      cartCount: 0
    });
    
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
});

module.exports = router;

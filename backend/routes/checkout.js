const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Checkout page
router.get('/', (req, res) => {
  const cart = req.session.cart || [];
  
  if (cart.length === 0) {
    return res.redirect('/cart');
  }
  
  // Calculate totals
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.price * item.quantity;
  });
  
  const shipping = subtotal > 1000 ? 0 : 50; // Free shipping over 1000
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + shipping + tax;
  
  res.render('checkout', {
    title: 'Checkout - Heriken',
    cart,
    subtotal,
    shipping,
    tax,
    total
  });
});

// Process checkout
router.post('/process', orderController.createOrder);

// Order confirmation
router.get('/success/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    
    res.render('checkout-success', {
      title: 'Order Placed Successfully - Heriken',
      orderId
    });
    
  } catch (error) {
    console.error('Checkout success error:', error);
    res.redirect('/');
  }
});

module.exports = router;

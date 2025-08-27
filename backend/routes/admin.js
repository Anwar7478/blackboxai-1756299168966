const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin authentication middleware
const requireAdmin = (req, res, next) => {
  // For demo purposes, we'll allow access without authentication
  // In production, you would check if user is logged in and has admin role
  if (req.session.userRole === 'admin') {
    return next();
  }
  
  // For now, allow access for demo
  // You can uncomment below lines for actual admin authentication
  // return res.status(403).render('error', {
  //   title: 'Access Denied',
  //   error: { message: 'Admin access required', status: 403 }
  // });
  
  next();
};

// Apply admin middleware to all routes
router.use(requireAdmin);

// Dashboard
router.get('/', adminController.dashboard);
router.get('/dashboard', adminController.dashboard);

// Product Management
router.get('/products', adminController.productList);
router.get('/products/add', adminController.addProductForm);
router.post('/products/add', adminController.addProduct);
router.get('/products/edit/:id', adminController.editProductForm);
router.post('/products/edit/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Category Management
router.get('/categories', adminController.categoryList);
router.post('/categories/add', adminController.addCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Order Management
router.get('/orders', adminController.orderList);
router.get('/orders/:id', adminController.orderDetails);

// Customer Management
router.get('/customers', adminController.customerList);

module.exports = router;

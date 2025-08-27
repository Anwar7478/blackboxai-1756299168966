const Order = require('../models/order');
const Product = require('../models/product');

exports.createOrder = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Please login to place an order'
      });
    }
    
    const { items, shippingAddress, paymentMethod } = req.body;
    
    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }
    
    if (!shippingAddress || !shippingAddress.name || !shippingAddress.address) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }
    
    // Calculate total amount and validate products
    let totalAmount = 0;
    const validatedItems = [];
    
    for (const item of items) {
      const product = await Product.getById(item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.productId} not found`
        });
      }
      
      if (item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid quantity'
        });
      }
      
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      
      validatedItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      });
    }
    
    // Create order
    const orderId = await Order.create({
      userId: req.session.userId,
      items: validatedItems,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'cash_on_delivery'
    });
    
    // Clear cart after successful order
    req.session.cart = [];
    
    res.json({
      success: true,
      message: 'Order placed successfully',
      orderId,
      redirect: `/orders/${orderId}`
    });
    
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to place order. Please try again.'
    });
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const order = await Order.getById(orderId);
    
    if (!order) {
      return res.status(404).render('error', {
        title: 'Order Not Found',
        error: { message: 'Order not found', status: 404 }
      });
    }
    
    // Check if user owns this order (or is admin)
    if (order.user_id !== req.session.userId && req.session.userRole !== 'admin') {
      return res.status(403).render('error', {
        title: 'Access Denied',
        error: { message: 'Access denied', status: 403 }
      });
    }
    
    res.render('order-details', {
      title: `Order #${order.id} - Heriken`,
      order
    });
    
  } catch (error) {
    console.error('Get order error:', error);
    next(error);
  }
};

exports.getUserOrders = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    
    const orders = await Order.getByUserId(req.session.userId, limit, offset);
    
    res.render('my-orders', {
      title: 'My Orders - Heriken',
      orders,
      currentPage: page,
      hasNextPage: orders.length === limit,
      hasPrevPage: page > 1
    });
    
  } catch (error) {
    console.error('Get user orders error:', error);
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    // Admin only
    if (req.session.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const orderId = req.params.id;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const updated = await Order.updateStatus(orderId, status);
    
    if (updated) {
      res.json({
        success: true,
        message: 'Order status updated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to update order status'
      });
    }
    
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
};

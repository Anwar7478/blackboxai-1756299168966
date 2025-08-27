const Product = require('../models/product');
const Category = require('../models/category');
const User = require('../models/user');
const Order = require('../models/order');

// Admin Dashboard
exports.dashboard = async (req, res, next) => {
  try {
    // Get dashboard statistics
    let stats = {
      totalProducts: 0,
      totalCategories: 0,
      totalUsers: 0,
      totalOrders: 0,
      recentOrders: []
    };
    
    try {
      // Try to get real stats from database
      const [productCount] = await require('../config/db').query('SELECT COUNT(*) as count FROM products');
      const [categoryCount] = await require('../config/db').query('SELECT COUNT(*) as count FROM categories');
      const [userCount] = await require('../config/db').query('SELECT COUNT(*) as count FROM users');
      const [orderCount] = await require('../config/db').query('SELECT COUNT(*) as count FROM orders');
      
      stats.totalProducts = productCount[0].count;
      stats.totalCategories = categoryCount[0].count;
      stats.totalUsers = userCount[0].count;
      stats.totalOrders = orderCount[0].count;
      
      // Get recent orders
      stats.recentOrders = await Order.getAll(5);
    } catch (dbError) {
      console.log('Database not available, using fallback stats');
      // Fallback stats when database is not available
      stats = {
        totalProducts: 0,
        totalCategories: 0,
        totalUsers: 0,
        totalOrders: 0,
        recentOrders: []
      };
    }
    
    res.render('admin/dashboard', {
      title: 'Admin Dashboard - Heriken',
      stats
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    next(error);
  }
};

// Product Management
exports.productList = async (req, res, next) => {
  try {
    let products = [];
    
    try {
      products = await Product.getAll();
    } catch (dbError) {
      console.log('Database not available, showing empty product list');
    }
    
    res.render('admin/products', {
      title: 'Manage Products - Admin',
      products
    });
  } catch (error) {
    console.error('Product list error:', error);
    next(error);
  }
};

exports.addProductForm = async (req, res, next) => {
  try {
    let categories = [];
    
    try {
      categories = await Category.getAll();
    } catch (dbError) {
      console.log('Database not available, showing empty categories');
    }
    
    res.render('admin/add-product', {
      title: 'Add Product - Admin',
      categories
    });
  } catch (error) {
    console.error('Add product form error:', error);
    next(error);
  }
};

exports.addProduct = async (req, res, next) => {
  try {
    const { name, description, price, originalPrice, categoryId, brandId, stock, sku, isFeatured, isNew } = req.body;
    
    // Validation
    if (!name || !price || !stock) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and stock are required'
      });
    }
    
    try {
      const [result] = await require('../config/db').query(`
        INSERT INTO products (name, description, price, original_price, category_id, brand_id, stock, sku, is_featured, is_new, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
      `, [name, description, parseFloat(price), originalPrice ? parseFloat(originalPrice) : null, categoryId || null, brandId || null, parseInt(stock), sku || null, isFeatured ? 1 : 0, isNew ? 1 : 0]);
      
      res.json({
        success: true,
        message: 'Product added successfully',
        productId: result.insertId
      });
    } catch (dbError) {
      console.error('Database error adding product:', dbError);
      res.status(500).json({
        success: false,
        message: 'Database not available. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product'
    });
  }
};

exports.editProductForm = async (req, res, next) => {
  try {
    const productId = req.params.id;
    let product = null;
    let categories = [];
    
    try {
      product = await Product.getById(productId);
      categories = await Category.getAll();
    } catch (dbError) {
      console.log('Database not available');
    }
    
    if (!product) {
      return res.status(404).render('error', {
        title: 'Product Not Found',
        error: { message: 'Product not found', status: 404 }
      });
    }
    
    res.render('admin/edit-product', {
      title: 'Edit Product - Admin',
      product,
      categories
    });
  } catch (error) {
    console.error('Edit product form error:', error);
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { name, description, price, originalPrice, categoryId, brandId, stock, sku, isFeatured, isNew } = req.body;
    
    try {
      const [result] = await require('../config/db').query(`
        UPDATE products 
        SET name = ?, description = ?, price = ?, original_price = ?, category_id = ?, brand_id = ?, stock = ?, sku = ?, is_featured = ?, is_new = ?, updated_at = NOW()
        WHERE id = ?
      `, [name, description, parseFloat(price), originalPrice ? parseFloat(originalPrice) : null, categoryId || null, brandId || null, parseInt(stock), sku || null, isFeatured ? 1 : 0, isNew ? 1 : 0, productId]);
      
      if (result.affectedRows > 0) {
        res.json({
          success: true,
          message: 'Product updated successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
    } catch (dbError) {
      console.error('Database error updating product:', dbError);
      res.status(500).json({
        success: false,
        message: 'Database not available. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    
    try {
      const [result] = await require('../config/db').query('UPDATE products SET is_active = 0 WHERE id = ?', [productId]);
      
      if (result.affectedRows > 0) {
        res.json({
          success: true,
          message: 'Product deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
    } catch (dbError) {
      console.error('Database error deleting product:', dbError);
      res.status(500).json({
        success: false,
        message: 'Database not available. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
};

// Category Management
exports.categoryList = async (req, res, next) => {
  try {
    let categories = [];
    
    try {
      categories = await Category.getWithProductCount();
    } catch (dbError) {
      console.log('Database not available, showing empty category list');
    }
    
    res.render('admin/categories', {
      title: 'Manage Categories - Admin',
      categories
    });
  } catch (error) {
    console.error('Category list error:', error);
    next(error);
  }
};

exports.addCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }
    
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const [result] = await require('../config/db').query(`
        INSERT INTO categories (name, slug, description, is_active, created_at, updated_at)
        VALUES (?, ?, ?, 1, NOW(), NOW())
      `, [name, slug, description || null]);
      
      res.json({
        success: true,
        message: 'Category added successfully',
        categoryId: result.insertId
      });
    } catch (dbError) {
      console.error('Database error adding category:', dbError);
      res.status(500).json({
        success: false,
        message: 'Database not available. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Add category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add category'
    });
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    
    try {
      const [result] = await require('../config/db').query('UPDATE categories SET is_active = 0 WHERE id = ?', [categoryId]);
      
      if (result.affectedRows > 0) {
        res.json({
          success: true,
          message: 'Category deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
    } catch (dbError) {
      console.error('Database error deleting category:', dbError);
      res.status(500).json({
        success: false,
        message: 'Database not available. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
};

// Order Management
exports.orderList = async (req, res, next) => {
  try {
    let orders = [];
    
    try {
      orders = await Order.getAll();
    } catch (dbError) {
      console.log('Database not available, showing empty order list');
    }
    
    res.render('admin/orders', {
      title: 'Manage Orders - Admin',
      orders
    });
  } catch (error) {
    console.error('Order list error:', error);
    next(error);
  }
};

exports.orderDetails = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    let order = null;
    
    try {
      order = await Order.getById(orderId);
    } catch (dbError) {
      console.log('Database not available');
    }
    
    if (!order) {
      return res.status(404).render('error', {
        title: 'Order Not Found',
        error: { message: 'Order not found', status: 404 }
      });
    }
    
    res.render('admin/order-details', {
      title: `Order #${order.id} - Admin`,
      order
    });
  } catch (error) {
    console.error('Order details error:', error);
    next(error);
  }
};

// Customer Management
exports.customerList = async (req, res, next) => {
  try {
    let customers = [];
    
    try {
      const [rows] = await require('../config/db').query(`
        SELECT u.*, COUNT(o.id) as order_count, COALESCE(SUM(o.total_amount), 0) as total_spent
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        WHERE u.role = 'user'
        GROUP BY u.id
        ORDER BY u.created_at DESC
      `);
      customers = rows;
    } catch (dbError) {
      console.log('Database not available, showing empty customer list');
    }
    
    res.render('admin/customers', {
      title: 'Manage Customers - Admin',
      customers
    });
  } catch (error) {
    console.error('Customer list error:', error);
    next(error);
  }
};

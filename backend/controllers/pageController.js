const Product = require('../models/product');
const Category = require('../models/category');

exports.homePage = async (req, res, next) => {
  try {
    // Try to fetch from database, but provide fallback data if database is not available
    let featuredProducts = [];
    let newProducts = [];
    let topCategories = [];
    
    try {
      featuredProducts = await Product.getFeatured(8);
      newProducts = await Product.getNew(8);
      topCategories = await Category.getTopCategories(6);
    } catch (dbError) {
      console.log('Database not available, using fallback data');
      // Fallback data when database is not available
      featuredProducts = [];
      newProducts = [];
      topCategories = [];
    }
    
    res.render('index', { 
      title: 'Heriken - Home',
      featuredProducts,
      newProducts,
      topCategories
    });
  } catch (error) {
    console.error('Error loading homepage:', error);
    next(error);
  }
};

exports.warrantyPolicy = (req, res) => {
  res.render('pages/warranty-policy', { 
    title: 'Warranty Policy - Heriken',
    pageTitle: 'Warranty Policy'
  });
};

exports.returnRefund = (req, res) => {
  res.render('pages/return-refund', { 
    title: 'Return & Refund Policy - Heriken',
    pageTitle: 'Return & Refund Policy'
  });
};

exports.privacyPolicy = (req, res) => {
  res.render('pages/privacy-policy', { 
    title: 'Privacy Policy - Heriken',
    pageTitle: 'Privacy Policy'
  });
};

exports.termsConditions = (req, res) => {
  res.render('pages/terms-conditions', { 
    title: 'Terms & Conditions - Heriken',
    pageTitle: 'Terms & Conditions'
  });
};

exports.aboutUs = (req, res) => {
  res.render('pages/about-us', { 
    title: 'About Us - Heriken',
    pageTitle: 'About Us'
  });
};

exports.newsletter = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }
    
    console.log('Newsletter subscription:', email);
    
    res.json({ 
      success: true, 
      message: 'Successfully subscribed to newsletter!' 
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to subscribe. Please try again.' 
    });
  }
};

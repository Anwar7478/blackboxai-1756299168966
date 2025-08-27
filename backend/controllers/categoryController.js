const Category = require('../models/category');
const Product = require('../models/product');

exports.listCategories = async (req, res, next) => {
  try {
    const categories = await Category.getWithProductCount();
    
    res.render('categories', { 
      title: 'Categories - Heriken',
      categories
    });
  } catch (error) {
    console.error('Error loading categories:', error);
    next(error);
  }
};

exports.categoryProducts = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;
    
    const category = await Category.getById(categoryId);
    if (!category) {
      return res.status(404).render('error', { 
        title: 'Category Not Found',
        error: { message: 'Category not found', status: 404 }
      });
    }
    
    const products = await Product.getByCategory(categoryId, limit, offset);
    
    res.render('category-products', { 
      title: `${category.name} - Heriken`,
      category,
      products,
      currentPage: page,
      hasNextPage: products.length === limit,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Error loading category products:', error);
    next(error);
  }
};

exports.getTopCategories = async (req, res, next) => {
  try {
    const categories = await Category.getTopCategories();
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching top categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

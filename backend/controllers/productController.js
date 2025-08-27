const Product = require('../models/product');

exports.listProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    
    let products;
    if (search) {
      products = await Product.search(search, limit, offset);
    } else {
      products = await Product.getAll(limit, offset);
    }
    
    res.render('products', { 
      title: 'Products - Heriken',
      products,
      currentPage: page,
      search,
      hasNextPage: products.length === limit,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Error loading products:', error);
    next(error);
  }
};

exports.productDetails = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await Product.getById(productId);
    
    if (!product) {
      return res.status(404).render('error', { 
        title: 'Product Not Found',
        error: { message: 'Product not found', status: 404 }
      });
    }
    
    // Get related products from same category
    const relatedProducts = await Product.getByCategory(product.category_id, 4);
    
    res.render('product-details', { 
      title: `${product.name} - Heriken`,
      product,
      relatedProducts: relatedProducts.filter(p => p.id !== product.id)
    });
  } catch (error) {
    console.error('Error loading product details:', error);
    next(error);
  }
};

exports.getFeatured = async (req, res, next) => {
  try {
    const products = await Product.getFeatured();
    res.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

exports.getNew = async (req, res, next) => {
  try {
    const products = await Product.getNew();
    res.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching new products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

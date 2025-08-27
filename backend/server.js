require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'herikenSecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Initialize cart and wishlist in session
app.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  if (!req.session.wishlist) {
    req.session.wishlist = [];
  }
  // Make cart and wishlist available to all views
  res.locals.cartCount = req.session.cart.length;
  res.locals.wishlistCount = req.session.wishlist.length;
  next();
});

// Routes
const indexRouter = require('./routes/index');
const productRouter = require('./routes/product');
const categoryRouter = require('./routes/category');
const cartRouter = require('./routes/cart');
const wishlistRouter = require('./routes/wishlist');
const checkoutRouter = require('./routes/checkout');
const pagesRouter = require('./routes/pages');
const adminRouter = require('./routes/admin');

app.use('/', indexRouter);
app.use('/products', productRouter);
app.use('/categories', categoryRouter);
app.use('/cart', cartRouter);
app.use('/wishlist', wishlistRouter);
app.use('/checkout', checkoutRouter);
app.use('/pages', pagesRouter);
app.use('/admin', adminRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { 
    title: 'Page Not Found',
    error: { message: 'Page not found', status: 404 }
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    title: 'Server Error',
    error: { message: 'Something went wrong!', status: 500 }
  });
});

app.listen(port, () => {
  console.log(`Heriken server running on http://localhost:${port}`);
  console.log('Make sure to install dependencies with: npm install');
});

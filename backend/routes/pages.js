const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

// Policy pages
router.get('/warranty-policy', pageController.warrantyPolicy);
router.get('/return-refund-policy', pageController.returnRefund);
router.get('/privacy-policy', pageController.privacyPolicy);
router.get('/terms-and-conditions', pageController.termsConditions);
router.get('/about-us', pageController.aboutUs);

// Additional pages from the original site
router.get('/work-with-us', (req, res) => {
  res.render('pages/work-with-us', { 
    title: 'Work With Us - Heriken',
    pageTitle: 'Work With Us'
  });
});

router.get('/why-shop-online-with-us', (req, res) => {
  res.render('pages/why-shop-online', { 
    title: 'Why Shop Online with Us - Heriken',
    pageTitle: 'Why Shop Online with Us'
  });
});

router.get('/online-purchase-procedure', (req, res) => {
  res.render('pages/online-purchase', { 
    title: 'Online Purchase Procedure - Heriken',
    pageTitle: 'Online Purchase Procedure'
  });
});

router.get('/online-payment-methods', (req, res) => {
  res.render('pages/online-payment-methods', { 
    title: 'Online Payment Methods - Heriken',
    pageTitle: 'Online Payment Methods'
  });
});

router.get('/online-payment-security', (req, res) => {
  res.render('pages/online-payment-security', { 
    title: 'Online Payment Security - Heriken',
    pageTitle: 'Online Payment Security'
  });
});

router.get('/contact-service-center', (req, res) => {
  res.render('pages/contact-service', { 
    title: 'Contact Service Center - Heriken',
    pageTitle: 'Contact Service Center'
  });
});

router.get('/after-sales-support', (req, res) => {
  res.render('pages/after-sales', { 
    title: 'After Sales Support - Heriken',
    pageTitle: 'After Sales Support'
  });
});

router.get('/faq', (req, res) => {
  res.render('pages/faq', { 
    title: 'FAQ - Heriken',
    pageTitle: 'Frequently Asked Questions'
  });
});

module.exports = router;

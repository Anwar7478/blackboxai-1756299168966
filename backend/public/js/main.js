// Main JavaScript for Heriken website
document.addEventListener('DOMContentLoaded', function() {
  
  // Newsletter subscription
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', handleNewsletterSubmission);
  }
  
  // Add to cart buttons
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', handleAddToCart);
  });
  
  // Add to wishlist buttons
  const addToWishlistButtons = document.querySelectorAll('.add-to-wishlist');
  addToWishlistButtons.forEach(button => {
    button.addEventListener('click', handleAddToWishlist);
  });
  
  // Quantity controls
  const quantityControls = document.querySelectorAll('.quantity-controls');
  quantityControls.forEach(control => {
    setupQuantityControls(control);
  });
  
  // Remove item buttons
  const removeButtons = document.querySelectorAll('.remove-item');
  removeButtons.forEach(button => {
    button.addEventListener('click', handleRemoveItem);
  });
  
  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener('click', function() {
      navMenu.classList.toggle('active');
    });
  }
  
  // Tab functionality
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', handleTabClick);
  });
  
  // Search functionality
  const searchForm = document.querySelector('.search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', handleSearch);
  }
});

// Newsletter subscription handler
async function handleNewsletterSubmission(e) {
  e.preventDefault();
  
  const form = e.target;
  const email = form.querySelector('input[type="email"]').value;
  const submitBtn = form.querySelector('button[type="submit"]');
  
  if (!email || !isValidEmail(email)) {
    showMessage('Please enter a valid email address', 'error');
    return;
  }
  
  // Disable button during submission
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Subscribing...';
  submitBtn.disabled = true;
  
  try {
    const response = await fetch('/newsletter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showMessage(data.message, 'success');
      form.reset();
    } else {
      showMessage(data.message, 'error');
    }
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    showMessage('Failed to subscribe. Please try again.', 'error');
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// Add to cart handler
async function handleAddToCart(e) {
  e.preventDefault();
  
  const button = e.target;
  const productId = button.dataset.productId;
  const quantity = button.dataset.quantity || 1;
  
  if (!productId) {
    showMessage('Product ID not found', 'error');
    return;
  }
  
  // Disable button during request
  const originalText = button.textContent;
  button.textContent = 'Adding...';
  button.disabled = true;
  
  try {
    const response = await fetch('/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId, quantity: parseInt(quantity) })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showMessage(data.message, 'success');
      updateCartCount(data.cartCount);
    } else {
      showMessage(data.message, 'error');
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    showMessage('Failed to add product to cart', 'error');
  } finally {
    button.textContent = originalText;
    button.disabled = false;
  }
}

// Add to wishlist handler
async function handleAddToWishlist(e) {
  e.preventDefault();
  
  const button = e.target;
  const productId = button.dataset.productId;
  
  if (!productId) {
    showMessage('Product ID not found', 'error');
    return;
  }
  
  // Disable button during request
  const originalText = button.textContent;
  button.textContent = 'Adding...';
  button.disabled = true;
  
  try {
    const response = await fetch('/wishlist/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showMessage(data.message, 'success');
      updateWishlistCount(data.wishlistCount);
    } else {
      showMessage(data.message, 'error');
    }
  } catch (error) {
    console.error('Add to wishlist error:', error);
    showMessage('Failed to add product to wishlist', 'error');
  } finally {
    button.textContent = originalText;
    button.disabled = false;
  }
}

// Quantity controls setup
function setupQuantityControls(control) {
  const decreaseBtn = control.querySelector('.quantity-decrease');
  const increaseBtn = control.querySelector('.quantity-increase');
  const quantityInput = control.querySelector('.quantity-input');
  const productId = control.dataset.productId;
  
  if (decreaseBtn) {
    decreaseBtn.addEventListener('click', () => {
      const currentValue = parseInt(quantityInput.value);
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
        updateCartQuantity(productId, currentValue - 1);
      }
    });
  }
  
  if (increaseBtn) {
    increaseBtn.addEventListener('click', () => {
      const currentValue = parseInt(quantityInput.value);
      quantityInput.value = currentValue + 1;
      updateCartQuantity(productId, currentValue + 1);
    });
  }
  
  if (quantityInput) {
    quantityInput.addEventListener('change', () => {
      const newValue = parseInt(quantityInput.value);
      if (newValue > 0) {
        updateCartQuantity(productId, newValue);
      } else {
        quantityInput.value = 1;
      }
    });
  }
}

// Update cart quantity
async function updateCartQuantity(productId, quantity) {
  try {
    const response = await fetch('/cart/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId, quantity })
    });
    
    const data = await response.json();
    
    if (data.success) {
      updateCartCount(data.cartCount);
      // Optionally reload the page to update totals
      if (window.location.pathname === '/cart') {
        location.reload();
      }
    } else {
      showMessage(data.message, 'error');
    }
  } catch (error) {
    console.error('Update cart error:', error);
    showMessage('Failed to update cart', 'error');
  }
}

// Remove item handler
async function handleRemoveItem(e) {
  e.preventDefault();
  
  const button = e.target;
  const productId = button.dataset.productId;
  const itemType = button.dataset.itemType || 'cart'; // cart or wishlist
  
  if (!productId) {
    showMessage('Product ID not found', 'error');
    return;
  }
  
  if (!confirm('Are you sure you want to remove this item?')) {
    return;
  }
  
  try {
    const endpoint = itemType === 'wishlist' ? '/wishlist/remove' : '/cart/remove';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showMessage(data.message, 'success');
      
      // Update counts
      if (itemType === 'wishlist') {
        updateWishlistCount(data.wishlistCount);
      } else {
        updateCartCount(data.cartCount);
      }
      
      // Remove item from DOM
      const itemElement = button.closest('.cart-item, .wishlist-item');
      if (itemElement) {
        itemElement.remove();
      }
      
      // Reload page if on cart/wishlist page to update totals
      if (window.location.pathname === '/cart' || window.location.pathname === '/wishlist') {
        location.reload();
      }
    } else {
      showMessage(data.message, 'error');
    }
  } catch (error) {
    console.error('Remove item error:', error);
    showMessage('Failed to remove item', 'error');
  }
}

// Tab click handler
function handleTabClick(e) {
  e.preventDefault();
  
  const clickedTab = e.target;
  const tabContainer = clickedTab.closest('.tabs');
  const tabs = tabContainer.querySelectorAll('.tab');
  
  // Remove active class from all tabs
  tabs.forEach(tab => tab.classList.remove('active'));
  
  // Add active class to clicked tab
  clickedTab.classList.add('active');
  
  // Handle tab content switching if needed
  const tabContent = clickedTab.dataset.tabContent;
  if (tabContent) {
    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.style.display = 'none';
    });
    
    // Show selected tab content
    const selectedContent = document.getElementById(tabContent);
    if (selectedContent) {
      selectedContent.style.display = 'block';
    }
  }
}

// Search handler
function handleSearch(e) {
  const form = e.target;
  const searchInput = form.querySelector('input[name="search"]');
  
  if (!searchInput.value.trim()) {
    e.preventDefault();
    showMessage('Please enter a search term', 'error');
  }
}

// Update cart count in header
function updateCartCount(count) {
  const cartBadge = document.querySelector('.cart-link .badge');
  if (cartBadge) {
    cartBadge.textContent = count;
  }
}

// Update wishlist count in header
function updateWishlistCount(count) {
  const wishlistBadge = document.querySelector('.wishlist-link .badge');
  if (wishlistBadge) {
    wishlistBadge.textContent = count;
  }
}

// Show message to user
function showMessage(message, type = 'info') {
  // Remove existing messages
  const existingMessages = document.querySelectorAll('.message');
  existingMessages.forEach(msg => msg.remove());
  
  // Create new message element
  const messageElement = document.createElement('div');
  messageElement.className = `message ${type}`;
  messageElement.textContent = message;
  
  // Insert at top of main content
  const mainContent = document.querySelector('.main-content') || document.querySelector('main') || document.body;
  mainContent.insertBefore(messageElement, mainContent.firstChild);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    messageElement.remove();
  }, 5000);
}

// Email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});

// Lazy loading for images (if needed)
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });
  
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

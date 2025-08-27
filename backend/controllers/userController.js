const User = require('../models/user');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.getByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Create user
    const userId = await User.create({ name, email, password, phone });
    
    // Set session
    req.session.userId = userId;
    req.session.userName = name;
    
    res.json({
      success: true,
      message: 'Registration successful',
      redirect: '/'
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Find user
    const user = await User.getByEmail(email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Validate password
    const isValidPassword = await User.validatePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Set session
    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.userRole = user.role;
    
    res.json({
      success: true,
      message: 'Login successful',
      redirect: '/'
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully',
      redirect: '/'
    });
  });
};

exports.profile = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }
    
    const user = await User.getById(req.session.userId);
    if (!user) {
      return res.redirect('/auth/login');
    }
    
    res.render('profile', {
      title: 'My Profile - Heriken',
      user
    });
    
  } catch (error) {
    console.error('Profile error:', error);
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Please login first'
      });
    }
    
    const { name, phone } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }
    
    const updated = await User.updateProfile(req.session.userId, { name, phone });
    
    if (updated) {
      req.session.userName = name;
      res.json({
        success: true,
        message: 'Profile updated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

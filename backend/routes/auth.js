// backend/routes/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Registration route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, phone } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email: new RegExp('^' + email + '$', 'i') });
    if (user) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Prepare new user data
    const newUser = {
      firstName: username,
      lastName: ' ',
      email,
      password,
      role,
      phone
    };

    if (role === 'operator') {
      newUser.operatorDetails = {
        companyName: username
      };
    }

    user = new User(newUser);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // If operator, return early with pending approval message
    if (role === 'operator') {
      return res.status(201).json({ message: 'Operator registration successful! Your account is pending approval.' });
    }

    // Create JWT payload
    const payload = { userId: user._id, role: user.role };

    // Sign JWT token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        const userResponse = user.toObject();
        delete userResponse.password;
        res.status(201).json({ token, user: userResponse });
      }
    );

  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});


// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password, adminOnly } = req.body;

    const user = await User.findOne({ email: new RegExp('^' + email + '$', 'i') });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (adminOnly && user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access only' });
    }

    const payload = { userId: user._id, role: user.role };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      const userResponse = user.toObject();
      delete userResponse.password;
      res.json({ token, user: userResponse });
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

module.exports = router;

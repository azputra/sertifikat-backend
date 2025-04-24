const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register admin
const registerAdmin = async (req, res) => {
  try {
    const { username, password, isAdmin } = req.body;
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const user = await User.create({
      username,
      password,
      isAdmin
    });
    
    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        isAdmin: user.isAdmin,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login admin
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        isAdmin: user.isAdmin,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

module.exports = { registerAdmin, loginAdmin };
const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', protect, admin, registerAdmin);
router.post('/login', loginAdmin);

module.exports = router;
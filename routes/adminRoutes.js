const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const adminOnly = require('../middleware/adminAuth');
const authenticate = require('../middleware/authMiddleware');
const {
  AdminLogin,
  getAdminProfile,
  changePassword,
  getDashboardStats,
} = require('../controllers/adminController');

router.post('/login', AdminLogin);
router.get('/profile', authenticate, adminOnly, getAdminProfile);
router.post('/change-password', authenticate, adminOnly, changePassword);
// routes/admin.js or routes/dashboard.js
router.get('/dashboard-stats', authenticate, adminOnly, getDashboardStats);

module.exports = router;

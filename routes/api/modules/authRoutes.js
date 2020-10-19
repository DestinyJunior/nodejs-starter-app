const express = require('express');
const {
  register,
  login,
  logout,
  getAuthUser,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword
} = require('../../../app/controllers/authController');

const router = express.Router();

const { protect } = require('../../../app/middlewares/auth');

router.post('/register', register);

router.post('/login', login);

router.get('/logout', logout);

router.get('/profile', protect, getAuthUser);

router.put('/update-details', protect, updateDetails);

router.put('/update-password', protect, updatePassword);

router.post('/forgot-password', forgotPassword);

router.put('/reset-password/:resettoken', resetPassword);

module.exports = router;

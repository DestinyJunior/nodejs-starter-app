const express = require('express');
const {
  register,
  login,
  logout,
  getAuthUser,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  verifyEmail,
  getEmailVerificationToken
} = require('../../../app/controllers/authController');

const router = express.Router();

const { protect, authorize} = require('../../../app/middlewares/auth');

router.post('/register', register);

router.post('/login', login);

router.get('/logout', protect, authorize('user', 'admin'), logout);

router.get('/profile', protect, authorize('user', 'admin'), getAuthUser);

router.put('/update-details', protect, updateDetails);

router.put('/update-password', protect, updatePassword);

router.post('/forgot-password', forgotPassword);

router.put('/reset-password/:resettoken', resetPassword);


router.put('/confirm-email/:token', verifyEmail);

router.put('/get-email-confirmation-token', protect, getEmailVerificationToken);



module.exports = router;

const crypto = require('crypto');
const ErrorResponse = require('../helpers/errorResponse');
const asyncHandler = require('../middlewares/async');
const sendEmail = require('../../configs/mailer');
const User = require('../models/User');
const VerificationToken = require('../models/EmailVerificationToken');




// @desc      Register user
// @route     POST /api/auth/register
// @access    Public
// eslint-disable-next-line no-unused-vars
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, role } = req.body;

  let cleanUser;
  let token;
  // register user
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role
  });

  token = await VerificationToken.create({ user: user._id });    
  
  

  // get verification token for email
  const finalToken = await token.getVerificationToken();

  await token.save();

 
  const message = `Welcome to Airtime Flip. Verify your email using the following link \n 
                    https://airtimeflip-cc149.web.app/verify-email/${finalToken}`;


  await sendEmail({
    email: user.email,
    subject: 'Welcome to Airtime Flip',
    message
  });

  // clean user document
  cleanUser = await User.findOne({ email });


  sendTokenResponse(cleanUser, 200, res, false);
});

// @desc      Login user
// @route     POST /api/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  let user;
  // Validate emil & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const userCheck = await User.findOne({ email }).select('+password');

  if (!userCheck) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await userCheck.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  } else {
    user = await User.findOne({ email });
  }

  sendTokenResponse(user, 200, res, true);
});

// @desc      Log user out / clear cookie
// @route     GET /api/auth/logout
// @access    Private
// eslint-disable-next-line no-unused-vars
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Get current logged in user
// @route     POST /api/auth/me
// @access    Private
// eslint-disable-next-line no-unused-vars
exports.getAuthUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc      Update user details
// @route     PUT /api/auth/updatedetails
// @access    Private
// eslint-disable-next-line no-unused-vars
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc      Update password
// @route     PUT /api/auth/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, false);
});

// @desc      Forgot password
// @route     POST /api/auth/forgotpassword
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you requested the reset of a password. Please click on this link to continue: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc      Reset password
// @route     PUT /api/auth/resetpassword/:resettoken
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, false);
});

// @desc      Get Verification Token
// @route     PUT /api/auth/verify-email/:token
// @access    Protect
exports.getEmailVerificationToken = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user.verified) {
    return next(new ErrorResponse('User verified already', 400));
  }

  const token = await VerificationToken.findOne({ user: user._id });

  const newToken = token.getVerificationToken();
  
  await token.save();

  const message = `Verify your email using the following link \n 
                     ${process.env.FRONTEND_URL}/verify-email/${newToken}`;

  await sendEmail({
    email: user.email,
    subject: 'Email Confirmation, AirtimeFlip',
    message
  });


  const msg = 'Email verification sent, check your email inbox.';

  sendTokenResponse(msg, 200, res, false);
});



// @desc      Verify Email
// @route     PUT /api/auth/verify-email/:token
// @access    Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  // console.log(req.params.token);
  const emailToken = req.params.token;

  // Get hashed token
  const verificationToken = crypto
    .createHash('sha256')
    .update(emailToken)
    .digest('hex');

  const token = await VerificationToken.findOne({
    token: verificationToken,
    expires: { $gt: Date.now() }
  });


  if (!token) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // update user verification status
  const user = await User.findById(token.user);

  user.verified = true;

  await user.save();

  // remove token from document
  token.token = undefined;
  token.expires = undefined;

  await token.save();

  const message = 'Email verification is successful';

  sendTokenResponse(message, 200, res, false);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, istoken) => {
  // Create token
  if (istoken) {
    const token = user.getSignedJwtToken();

    const options = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
      options.secure = true;
    }

    res
      .status(statusCode)
      .cookie('token', token, options)
      .json({
        success: true,
        data: user,
        token
      });
  } else {
    // send data only
    res
      .status(statusCode)
      .json({
        success: true,
        data: user,
      });
  }
 
};
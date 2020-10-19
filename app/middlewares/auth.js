const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../helpers/errorResponse');
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
    // Set token from cookie
  }
  // using cookie for token instead of headers
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }
 
  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// grant access to specific roles ( admin , users)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          'Unauthorized or forbidden',
          403
        )
      );
    }
    next();
  };
};

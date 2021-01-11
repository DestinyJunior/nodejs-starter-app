import { createHash } from "crypto";
import ErrorResponse from "../helpers/errorResponse.js";
import asyncHandler from "../middlewares/async.js";
import sendEmail from "../../configs/mailer.js";
import User from "../models/User.js";
import EmailVerificationToken from "../models/EmailVerificationToken.js";

export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, role } = req.body;

  let cleanUser;
  let token;
  // register user
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role,
  });

  token = await EmailVerificationToken.create({ user: user._id });

  // get verification token for email
  const finalToken = await token.getVerificationToken();

  await token.save();

  const FRONTEND_URL = process.env.FRONTEND_URL;

  const message = `Welcome to NodeJs Starter. Verify your email using the following link \n 
                    https://${FRONTEND_URL}/verify-email/${finalToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Welcome to Boromie",
      message,
    });
  } catch (e) {
    next(new ErrorResponse("Failed to send mail", 500));
  }

  // clean user document
  cleanUser = await User.findOne({ email });

  sendTokenResponse(cleanUser, 200, res, false);
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  let user;
  // Validate emil & password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  // Check for user
  const userCheck = await User.findOne({ email }).select("+password");

  if (!userCheck) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Check if password matches
  const isMatch = await userCheck.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  } else {
    user = await User.findOne({ email });
  }

  sendTokenResponse(user, 200, res, true);
});

export const logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

export const getAuthUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Password is incorrect", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, false);
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse("There is no user with that email", 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you requested the reset of a password. Please click on this link to continue: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    res.status(200).json({ success: true, data: "Email sent" });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse("Email could not be sent", 500));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid token", 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, false);
});

export const getEmailVerificationToken = asyncHandler(
  async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (user.verified) {
      return next(new ErrorResponse("User verified already", 400));
    }

    const token = await EmailVerificationToken.findOne({ user: user._id });

    const newToken = token.getVerificationToken();

    await token.save();

    const message = `Verify your email using the following link \n 
                     ${process.env.FRONTEND_URL}/verify-email/${newToken}`;

    await sendEmail({
      email: user.email,
      subject: "Email Confirmation, NodeJs Starter",
      message,
    });

    const msg = "Email verification sent, check your email inbox.";

    sendTokenResponse(msg, 200, res, false);
  }
);

export const verifyEmail = asyncHandler(async (req, res, next) => {
  // console.log(req.params.token);
  const emailToken = req.params.token;

  // Get hashed token
  const verificationToken = createHash("sha256")
    .update(emailToken)
    .digest("hex");

  const token = await EmailVerificationToken.findOne({
    token: verificationToken,
    expires: { $gt: Date.now() },
  });

  if (!token) {
    return next(new ErrorResponse("Invalid token", 400));
  }

  // update user verification status
  const user = await User.findById(token.user);

  user.verified = true;

  await user.save();

  // remove token from document
  token.token = undefined;
  token.expires = undefined;

  await token.save();

  const message = "Email verification is successful";

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
      httpOnly: true,
    };

    if (process.env.NODE_ENV === "production") {
      options.secure = true;
    }

    res.status(statusCode).cookie("token", token, options).json({
      success: true,
      data: user,
      token,
    });
  } else {
    // send data only
    res.status(statusCode).json({
      success: true,
      data: user,
    });
  }
};

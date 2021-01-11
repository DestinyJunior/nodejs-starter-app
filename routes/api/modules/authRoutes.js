import express from "express";
const router = express.Router();

import {
  register,
  login,
  logout,
  getAuthUser,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  verifyEmail,
  getEmailVerificationToken,
} from "../../../app/controllers/authController.js";

import { protect, authorize } from "../../../app/middlewares/auth.js";

router.post("/register", register);

router.post("/login", login);

router.get("/logout", protect, authorize("user", "admin"), logout);

router.get("/profile", protect, authorize("user", "admin"), getAuthUser);

router.put("/update-details", protect, updateDetails);

router.put("/update-password", protect, updatePassword);

router.post("/forgot-password", forgotPassword);

router.put("/reset-password/:resettoken", resetPassword);

router.put("/confirm-email/:token", verifyEmail);

router.put("/get-email-confirmation-token", protect, getEmailVerificationToken);

export default router;


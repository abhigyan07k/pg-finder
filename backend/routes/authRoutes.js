const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");
const profileUpload = require("../middleware/profileUpload");
const {
  register,
  sendRegisterOtp,
  verifyRegisterOtp,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  getMyProfile,
  updateProfilePhoto,
  updateMyProfile,
} = require("../controllers/authController");

// PUBLIC ROUTES
router.post("/send-register-otp", sendRegisterOtp);
router.post("/verify-register-otp", verifyRegisterOtp);
router.post("/register", register);
router.post("/google-login", authController.googleLogin);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// PROTECTED ROUTE
router.get("/me", authMiddleware.verifyToken, getMyProfile);
router.patch("/update-profile", authMiddleware.verifyToken, updateMyProfile);
router.patch("/change-password", authMiddleware.verifyToken, changePassword);
router.patch(
  "/profile-photo",
  authMiddleware.verifyToken,
  profileUpload.single("profileImage"),
  updateProfilePhoto,
);
module.exports = router;

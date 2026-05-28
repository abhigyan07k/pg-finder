const express = require("express");
const router = express.Router();

const {
  createReview,
  getPropertyReviews,
  updateReview,
  deleteReview,
  getPendingReviews,
  approveReview,
  rejectReview,
} = require("../controllers/reviewController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const verifyToken = authMiddleware.verifyToken || authMiddleware;

// ================== ADMIN ROUTES (TOP PRIORITY) ==================

//get all pending reviews
router.get("/admin/pending", verifyToken, adminMiddleware, getPendingReviews);

//approve review
router.patch(
  "/admin/approve/:reviewId",
  verifyToken,
  adminMiddleware,
  approveReview,
);

//reject review
router.patch(
  "/admin/reject/:reviewId",
  verifyToken,
  adminMiddleware,
  rejectReview,
);

// ================== USER ROUTES ==================

//create review
router.post("/property/:propertyId", verifyToken, createReview);

//public hona chahiye (approved reviews dikhane ke liye)
router.get("/property/:propertyId", getPropertyReviews);

//update review
router.put("/:reviewId", verifyToken, updateReview);

//delete review
router.delete("/:reviewId", verifyToken, deleteReview);

module.exports = router;

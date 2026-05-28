const express = require("express");
const router = express.Router();

const inquiryController = require("../controllers/inquiryController");
const { verifyToken } = require("../middleware/authMiddleware");

// CREATE INQUIRY
router.post("/create", verifyToken, inquiryController.createInquiry);

// OWNER RECENT INQUIRIES
router.get(
  "/owner-recent",
  verifyToken,
  inquiryController.getRecentOwnerInquiries,
);

// OWNER INQUIRY STATS (NEW)
router.get("/owner/stats", verifyToken, inquiryController.getOwnerInquiryStats);

module.exports = router;

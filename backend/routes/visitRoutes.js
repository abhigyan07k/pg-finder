const express = require("express");
const router = express.Router();

const visitController = require("../controllers/visitController");
const authMiddleware = require("../middleware/authMiddleware");

// Create visit request - Renter
router.post(
  "/create",
  authMiddleware.verifyToken || authMiddleware,
  visitController.createVisit,
);

// Get renter's own visit requests
router.get(
  "/my-visits",
  authMiddleware.verifyToken || authMiddleware,
  visitController.getMyVisits,
);

// Get owner's visit requests
router.get(
  "/owner-visits",
  authMiddleware.verifyToken || authMiddleware,
  visitController.getOwnerVisits,
);

// Approve / Reject visit request
router.patch(
  "/status/:id",
  authMiddleware.verifyToken || authMiddleware,
  visitController.updateVisitStatus,
);

module.exports = router;

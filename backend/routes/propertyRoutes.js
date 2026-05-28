const express = require("express");
const router = express.Router();

const propertyController = require("../controllers/propertyController");
const { verifyToken } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const adminMiddleware = require("../middleware/adminMiddleware");

router.post(
  "/create",
  verifyToken,
  upload.array("images", 8),
  propertyController.createProperty,
);

router.get("/my-properties", verifyToken, propertyController.getMyProperties);

router.get("/active-listings", propertyController.getActiveListings);

router.get("/view/:id", propertyController.getSingleProperty);

router.get(
  "/related/:id",
  verifyToken,
  propertyController.getRelatedProperties,
);

router.get(
  "/admin/all",
  verifyToken,
  adminMiddleware,
  propertyController.getAllPropertiesAdmin,
);

router.get(
  "/analytics/:id",
  verifyToken,
  propertyController.getPropertyAnalytics,
);
router.patch("/boost/:id", verifyToken, propertyController.activateBoost);

router.patch(
  "/admin/approve/:id",
  verifyToken,
  adminMiddleware,
  propertyController.approveProperty,
);

router.patch(
  "/admin/reject/:id",
  verifyToken,
  adminMiddleware,
  propertyController.rejectProperty,
);

router.put(
  "/update/:id",
  verifyToken,
  upload.array("images", 8),
  propertyController.updateProperty,
);

router.patch(
  "/toggle-status/:id",
  verifyToken,
  propertyController.togglePropertyStatus,
);

router.delete("/delete/:id", verifyToken, propertyController.deleteProperty);

router.delete(
  "/admin/delete/:id",
  verifyToken,
  adminMiddleware,
  propertyController.deletePropertyAdmin,
);

router.post("/wishlist/:id", verifyToken, propertyController.toggleWishlist);

router.get("/wishlist", verifyToken, propertyController.getWishlist);

router.get("/wishlist/check/:id", verifyToken, propertyController.isInWishlist);

module.exports = router;

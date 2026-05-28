const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

const verifyToken = authMiddleware.verifyToken || authMiddleware;

router.get("/", verifyToken, notificationController.getNotifications);

router.patch("/read-all", verifyToken, notificationController.markAllAsRead);

router.patch("/read/:id", verifyToken, notificationController.markAsRead);

router.delete("/:id", verifyToken, notificationController.deleteNotification);

module.exports = router;

const express = require("express");
const router = express.Router();

const chatController = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");

const verifyToken = authMiddleware.verifyToken || authMiddleware;

router.post("/start", verifyToken, chatController.startConversation);

router.get("/my-conversations", verifyToken, chatController.getMyConversations);

router.get(
  "/conversation/:id",
  verifyToken,
  chatController.getConversationById,
);

router.get("/messages/:id", verifyToken, chatController.getMessages);

router.post("/send/:conversationId", verifyToken, chatController.sendMessage);

module.exports = router;

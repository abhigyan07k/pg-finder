const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Property = require("../models/Property");

// Start or get conversation
exports.startConversation = async (req, res) => {
  try {
    const { propertyId } = req.body;

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (property.owner.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot chat with yourself",
      });
    }

    let conversation = await Conversation.findOne({
      property: propertyId,
      owner: property.owner,
      renter: req.user.id,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        property: propertyId,
        owner: property.owner,
        renter: req.user.id,
      });

      //Analytics: chat count only for new conversation
      await Property.findByIdAndUpdate(propertyId, {
        $inc: { chatCount: 1 },
      });
    }

    return res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get conversation details
exports.getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate("property", "title city price images")
      .populate("owner", "name email")
      .populate("renter", "name email");

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant =
      conversation.owner._id.toString() === req.user.id ||
      conversation.renter._id.toString() === req.user.id;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get messages
exports.getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant =
      conversation.owner.toString() === req.user.id ||
      conversation.renter.toString() === req.user.id;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const messages = await Message.find({
      conversation: req.params.id,
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name")
      .populate("receiver", "name");

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { conversationId } = req.params;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isOwner = conversation.owner.toString() === req.user.id;
    const isRenter = conversation.renter.toString() === req.user.id;

    if (!isOwner && !isRenter) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const receiver = isOwner ? conversation.renter : conversation.owner;

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      receiver,
      text: text.trim(),
    });

    conversation.lastMessage = text.trim();
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name")
      .populate("receiver", "name");

    const io = req.app.get("io");

    if (io) {
      io.to(receiver.toString()).emit("receiveMessage", populatedMessage);
      io.to(req.user.id.toString()).emit("messageSent", populatedMessage);
    }

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (err) {
    console.error("SEND MESSAGE ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.getMyConversations = async (req, res) => {
  try {
    console.log("Logged user:", req.user.id);

    const allConversations = await Conversation.find({});
    console.log("All conversations:", allConversations);

    const conversations = await Conversation.find({
      $or: [{ owner: req.user.id }, { renter: req.user.id }],
    })
      .populate("property", "title city price images")
      .populate("owner", "name email")
      .populate("renter", "name email")
      .sort({ lastMessageAt: -1 });

    console.log("Matched conversations:", conversations.length);

    return res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (err) {
    console.error("GET MY CONVERSATIONS ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

const Inquiry = require("../models/Inquiry");
const Property = require("../models/Property");
const Notification = require("../models/Notification");

// CREATE INQUIRY
exports.createInquiry = async (req, res) => {
  try {
    const { propertyId, name, phone, email, message } = req.body;

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const inquiry = await Inquiry.create({
      property: property._id,
      owner: property.owner,
      sender: req.user?.id || null,
      name,
      phone,
      email,
      message,
    });
    await Property.findByIdAndUpdate(propertyId, {
      $inc: { inquiryCount: 1 },
    });

    await Notification.create({
      receiver: property.owner,
      sender: req.user?.id || null,
      property: property._id,
      inquiry: inquiry._id,
      type: "INQUIRY",
      title: "New Inquiry Received",
      message: `${name} sent an inquiry for your property.`,
    });

    return res.status(201).json({
      success: true,
      message: "Inquiry sent successfully",
      data: inquiry,
    });
  } catch (error) {
    console.error("CREATE INQUIRY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET OWNER RECENT INQUIRIES
exports.getRecentOwnerInquiries = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const inquiries = await Inquiry.find({ owner: ownerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("property", "title")
      .populate("sender", "name email");

    return res.status(200).json({
      success: true,
      data: inquiries,
    });
  } catch (error) {
    console.error("GET INQUIRIES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET OWNER INQUIRY STATS
exports.getOwnerInquiryStats = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const total = await Inquiry.countDocuments({ owner: ownerId });

    const newCount = await Inquiry.countDocuments({
      owner: ownerId,
      status: "NEW",
    });

    const contacted = await Inquiry.countDocuments({
      owner: ownerId,
      status: "CONTACTED",
    });

    const closed = await Inquiry.countDocuments({
      owner: ownerId,
      status: "CLOSED",
    });

    return res.status(200).json({
      success: true,
      data: {
        total,
        new: newCount,
        contacted,
        closed,
      },
    });
  } catch (error) {
    console.error("GET INQUIRY STATS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

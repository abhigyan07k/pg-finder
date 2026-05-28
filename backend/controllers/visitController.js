const Visit = require("../models/VisitModel");
const Property = require("../models/Property");
const Notification = require("../models/Notification");

exports.createVisit = async (req, res) => {
  try {
    const { propertyId, visitDate, visitTime, message } = req.body;

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (property.owner.toString() === req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You cannot schedule a visit for your own property",
      });
    }

    const visit = await Visit.create({
      property: propertyId,
      renter: req.user.id,
      owner: property.owner,
      visitDate,
      visitTime,
      message,
    });

    await Property.findByIdAndUpdate(propertyId, {
      $inc: { visitCount: 1 },
    });

    const notification = await Notification.create({
      receiver: property.owner,
      sender: req.user.id,
      property: property._id,
      visit: visit._id,
      type: "VISIT_REQUEST",
      title: "New Visit Request",
      message: `${req.user.name || "A user"} requested a visit for your property.`,
    });

    const io = req.app.get("io");

    if (io) {
      io.to(property.owner.toString()).emit("newNotification", notification);
    }

    return res.status(201).json({
      success: true,
      message: "Visit request successful",
      data: visit,
    });
  } catch (err) {
    console.error("CREATE VISIT ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Get my visit request
exports.getMyVisits = async (req, res) => {
  try {
    const visits = await Visit.find({ renter: req.user.id })
      .populate("property")
      .populate("owner", "name email");

    return res.status(200).json({ success: true, data: visits });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get Owner Visit Request
exports.getOwnerVisits = async (req, res) => {
  try {
    const visits = await Visit.find({ owner: req.user.id })
      .populate("property")
      .populate("renter", "name email");

    return res.status(200).json({ success: true, data: visits });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Approve/Reject Visit By Owner
exports.updateVisitStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;

    const allowedStatus = ["APPROVED", "REJECTED"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid visit status",
      });
    }

    const visit = await Visit.findById(req.params.id).populate(
      "property",
      "title",
    );

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: "Visit not found",
      });
    }

    if (visit.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    visit.status = status;

    if (status === "REJECTED") {
      visit.rejectReason = reason || "";
    }

    await visit.save();

    const notification = await Notification.create({
      receiver: visit.renter,
      sender: req.user.id,
      property: visit.property._id,
      visit: visit._id,
      type: status === "APPROVED" ? "VISIT_APPROVED" : "VISIT_REJECTED",
      title:
        status === "APPROVED"
          ? "Visit Request Approved"
          : "Visit Request Rejected",
      message:
        status === "APPROVED"
          ? `Your visit request for ${visit.property.title} has been approved.`
          : reason
            ? `Your visit request for ${visit.property.title} was rejected. Reason: ${reason}`
            : `Your visit request for ${visit.property.title} was rejected.`,
    });

    const io = req.app.get("io");

    if (io) {
      io.to(visit.renter.toString()).emit("newNotification", notification);
    }

    return res.status(200).json({
      success: true,
      message:
        status === "APPROVED"
          ? "Visit approved successfully"
          : "Visit rejected successfully",
      data: visit,
    });
  } catch (err) {
    console.error("UPDATE VISIT STATUS ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

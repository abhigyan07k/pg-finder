const Review = require("../models/Review");
const Property = require("../models/Property");
const Notification = require("../models/Notification");
// Helper: approved reviews ke basis par rating recalculate
const recalculatePropertyRating = async (propertyId) => {
  const approvedReviews = await Review.find({
    property: propertyId,
    status: "APPROVED",
  });

  const totalReviews = approvedReviews.length;

  let averageRating = 0;

  if (totalReviews > 0) {
    const avgRating =
      approvedReviews.reduce((sum, item) => sum + item.rating, 0) /
      totalReviews;

    averageRating = Number(avgRating.toFixed(1));
  }

  await Property.findByIdAndUpdate(propertyId, {
    totalReviews,
    averageRating,
  });
};

// Create review
exports.createReview = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Rating and comment are required",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Owner cannot review own property
    if (property.owner.toString() === req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Owner cannot review own property",
      });
    }

    // One user can review only once per property
    const existingReview = await Review.findOne({
      property: propertyId,
      user: req.user.id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this property",
      });
    }

    const review = await Review.create({
      property: propertyId,
      user: req.user.id,
      rating,
      comment,
      status: "PENDING",
    });

    property.reviews.push(review._id);
    await property.save();

    res.status(201).json({
      success: true,
      message:
        "Review submitted successfully. It will be visible after admin approval.",
      data: review,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Public/user side: only approved reviews visible
exports.getPropertyReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const reviews = await Review.find({
      property: propertyId,
      status: "APPROVED",
    })
      .populate("user", "name email userType")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can edit only your own review",
      });
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    // Edit ke baad dobara admin approval required
    review.status = "PENDING";

    await review.save();

    await recalculatePropertyRating(review.property);

    res.status(200).json({
      success: true,
      message:
        "Review updated successfully. It will be visible after admin approval.",
      data: review,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own review",
      });
    }

    const property = await Property.findById(review.property);

    await Review.findByIdAndDelete(reviewId);

    if (property) {
      property.reviews = property.reviews.filter(
        (id) => id.toString() !== reviewId,
      );

      await property.save();

      await recalculatePropertyRating(property._id);
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Admin: pending reviews
exports.getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: "PENDING" })
      .populate("user", "name email userType")
      .populate("property", "title city price images")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Admin: approve review
exports.approveReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId).populate(
      "property",
      "title",
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.status = "APPROVED";
    await review.save();

    await recalculatePropertyRating(review.property._id);

    await Notification.create({
      receiver: review.user,
      sender: req.user.id,
      property: review.property._id,
      type: "GENERAL",
      title: "Review Approved",
      message: `Your review for ${review.property.title} has been approved and is now visible.`,
    });

    res.status(200).json({
      success: true,
      message: "Review approved successfully",
      data: review,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//Admin can reject review
exports.rejectReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId).populate(
      "property",
      "title",
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.status = "REJECTED";
    await review.save();

    await recalculatePropertyRating(review.property._id);

    await Notification.create({
      receiver: review.user,
      sender: req.user.id,
      property: review.property._id,
      type: "GENERAL",
      title: "Review Rejected",
      message: `Your review for ${review.property.title} was rejected by admin.`,
    });

    res.status(200).json({
      success: true,
      message: "Review rejected successfully",
      data: review,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

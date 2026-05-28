const Property = require("../models/Property");
const User = require("../models/User");
const Notification = require("../models/Notification");
const getImageUrls = (req) => {
  return req.files
    ? req.files.map(
        (file) => `http://localhost:8000/uploads/properties/${file.filename}`,
      )
    : [];
};

const parseJSON = (value, fallback) => {
  try {
    if (!value) return fallback;
    if (typeof value === "object") return value;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const parseBoolean = (value) => {
  return value === true || value === "true";
};

const createProperty = async (req, res) => {
  try {
    const {
      title,
      propertyType,
      listingFor,
      description,
      fullAddress,
      city,
      state,
      pinCode,
      nearbyLandmark,
      bhk,
      area,
      furnishing,
      bathrooms,
      price,
      phone,

      roomFeatures,
      amenities,
      tenantPreference,
      rules,
      depositAmount,
      maintenanceCharges,
      availableFrom,
      minimumStay,
      floor,
      totalFloors,

      availableImmediately,
      noticePeriod,
      leaseDuration,
      rentNegotiable,
      sharingType,
      foodDetails,
      electricityIncluded,
      waterIncluded,
      extraCharges,
      securityFeatures,
      nearbyEssentials,
      facing,
      parkingType,
      workFriendly,
      highSpeedInternet,
      couplesAllowed,
      studentsAllowed,
      workingProfessionalsAllowed,
      propertyAge,
      balconyView,
      ownerInstructions,
    } = req.body;

    if (
      !title ||
      !propertyType ||
      !listingFor ||
      !description ||
      !fullAddress ||
      !city ||
      !state ||
      !bhk ||
      !area ||
      !price ||
      !phone
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const parsedRoomFeatures = parseJSON(roomFeatures, {});
    const parsedAmenities = parseJSON(amenities, []);
    const parsedRules = parseJSON(rules, {});
    const parsedFoodDetails = parseJSON(foodDetails, {});
    const parsedSecurityFeatures = parseJSON(securityFeatures, []);
    const parsedNearbyEssentials = parseJSON(nearbyEssentials, []);

    const property = await Property.create({
      title,
      propertyType,
      listingFor,
      description,
      fullAddress,
      city,
      state,
      pinCode,
      nearbyLandmark,
      bhk,

      area: Number(area),
      furnishing,
      bathrooms: Number(bathrooms) || 0,
      price: Number(price),
      phone,

      roomFeatures: {
        acType: parsedRoomFeatures.acType || "NON_AC",
        attachedBathroom: parseBoolean(parsedRoomFeatures.attachedBathroom),
        balcony: parseBoolean(parsedRoomFeatures.balcony),
      },

      amenities: parsedAmenities,

      tenantPreference: tenantPreference || "ANYONE",

      rules: {
        smokingAllowed: parseBoolean(parsedRules.smokingAllowed),
        drinkingAllowed: parseBoolean(parsedRules.drinkingAllowed),
        visitorAllowed: parseBoolean(parsedRules.visitorAllowed),
      },

      depositAmount: Number(depositAmount) || 0,
      maintenanceCharges: Number(maintenanceCharges) || 0,
      availableFrom: availableFrom || null,
      minimumStay: minimumStay || "",

      floor: Number(floor) || 0,
      totalFloors: Number(totalFloors) || 0,

      availableImmediately: parseBoolean(availableImmediately),
      noticePeriod: noticePeriod || "",
      leaseDuration: leaseDuration || "",
      rentNegotiable: parseBoolean(rentNegotiable),
      sharingType: sharingType || "NONE",

      foodDetails: {
        vegFood: parseBoolean(parsedFoodDetails.vegFood),
        nonVegFood: parseBoolean(parsedFoodDetails.nonVegFood),
        breakfastIncluded: parseBoolean(parsedFoodDetails.breakfastIncluded),
        lunchIncluded: parseBoolean(parsedFoodDetails.lunchIncluded),
        dinnerIncluded: parseBoolean(parsedFoodDetails.dinnerIncluded),
      },

      electricityIncluded: parseBoolean(electricityIncluded),
      waterIncluded: parseBoolean(waterIncluded),
      extraCharges: Number(extraCharges) || 0,

      securityFeatures: parsedSecurityFeatures,
      nearbyEssentials: parsedNearbyEssentials,

      facing: facing || "NONE",
      parkingType: parkingType || "NONE",

      workFriendly: parseBoolean(workFriendly),
      highSpeedInternet: parseBoolean(highSpeedInternet),
      couplesAllowed: parseBoolean(couplesAllowed),
      studentsAllowed: parseBoolean(studentsAllowed),
      workingProfessionalsAllowed: parseBoolean(workingProfessionalsAllowed),

      propertyAge: propertyAge || "UNKNOWN",
      balconyView: balconyView || "NONE",
      ownerInstructions: ownerInstructions || "",

      images: getImageUrls(req),
      owner: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Property added successfully",
      data: property,
    });
  } catch (error) {
    console.error("CREATE PROPERTY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user.id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    console.error("GET MY PROPERTIES ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSingleProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "owner",
      "name email phone",
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const userId = req.user?.id || null;
    const userRole = req.user?.role;

    const isAdmin = userRole === "ADMIN" || userRole === "SUB_ADMIN";
    const isOwnProperty = userId && property.owner?._id?.toString() === userId;

    if (!isAdmin && !isOwnProperty && !property.isActive) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this property",
      });
    }

    //Analytics: total views
    property.views = (property.views || 0) + 1;

    //Analytics: unique views only for logged-in users
    if (userId) {
      const alreadyViewed = property.uniqueViews.some(
        (viewerId) => viewerId.toString() === userId,
      );

      if (!alreadyViewed) {
        property.uniqueViews.push(userId);
      }
    }

    await property.save();

    return res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error("GET SINGLE PROPERTY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPropertyAnalytics = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Only owner/admin
    const isOwner = property.owner.toString() === req.user.id;

    const isAdmin = req.user.role === "ADMIN" || req.user.role === "SUB_ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        views: property.views || 0,
        uniqueViews: property.uniqueViews?.length || 0,
        inquiryCount: property.inquiryCount || 0,
        wishlistCount: property.wishlistCount || 0,
        visitCount: property.visitCount || 0,
        chatCount: property.chatCount || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProperty = async (req, res) => {
  try {
    const existingProperty = await Property.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const {
      title,
      propertyType,
      listingFor,
      description,
      fullAddress,
      city,
      state,
      pinCode,
      nearbyLandmark,
      bhk,
      floor,
      totalFloors,
      area,
      furnishing,
      bathrooms,
      price,
      phone,
      existingImages,

      roomFeatures,
      amenities,
      tenantPreference,
      rules,
      depositAmount,
      maintenanceCharges,
      availableFrom,
      minimumStay,

      availableImmediately,
      noticePeriod,
      leaseDuration,
      rentNegotiable,
      sharingType,
      foodDetails,
      electricityIncluded,
      waterIncluded,
      extraCharges,
      securityFeatures,
      nearbyEssentials,
      facing,
      parkingType,
      workFriendly,
      highSpeedInternet,
      couplesAllowed,
      studentsAllowed,
      workingProfessionalsAllowed,
      propertyAge,
      balconyView,
      ownerInstructions,
    } = req.body;

    let oldImages = existingProperty.images || [];

    if (existingImages) {
      oldImages = parseJSON(existingImages, existingProperty.images || []);
    }

    const updatedImages = [...oldImages, ...getImageUrls(req)].slice(0, 8);

    const parsedRoomFeatures = parseJSON(roomFeatures, {});
    const parsedAmenities = parseJSON(amenities, []);
    const parsedRules = parseJSON(rules, {});
    const parsedFoodDetails = parseJSON(foodDetails, {});
    const parsedSecurityFeatures = parseJSON(securityFeatures, []);
    const parsedNearbyEssentials = parseJSON(nearbyEssentials, []);

    existingProperty.title = title;
    existingProperty.propertyType = propertyType;
    existingProperty.listingFor = listingFor;
    existingProperty.description = description;
    existingProperty.fullAddress = fullAddress;
    existingProperty.city = city;
    existingProperty.state = state;
    existingProperty.pinCode = pinCode;
    existingProperty.nearbyLandmark = nearbyLandmark;
    existingProperty.bhk = bhk;
    existingProperty.floor = Number(floor) || 0;
    existingProperty.totalFloors = Number(totalFloors) || 0;
    existingProperty.area = Number(area);
    existingProperty.furnishing = furnishing;
    existingProperty.bathrooms = Number(bathrooms) || 0;
    existingProperty.price = Number(price);
    existingProperty.phone = phone;

    existingProperty.roomFeatures = {
      acType: parsedRoomFeatures.acType || "NON_AC",
      attachedBathroom: parseBoolean(parsedRoomFeatures.attachedBathroom),
      balcony: parseBoolean(parsedRoomFeatures.balcony),
    };

    existingProperty.amenities = parsedAmenities;

    existingProperty.tenantPreference = tenantPreference || "ANYONE";

    existingProperty.rules = {
      smokingAllowed: parseBoolean(parsedRules.smokingAllowed),
      drinkingAllowed: parseBoolean(parsedRules.drinkingAllowed),
      visitorAllowed: parseBoolean(parsedRules.visitorAllowed),
    };

    existingProperty.depositAmount = Number(depositAmount) || 0;
    existingProperty.maintenanceCharges = Number(maintenanceCharges) || 0;
    existingProperty.availableFrom = availableFrom || null;
    existingProperty.minimumStay = minimumStay || "";

    existingProperty.availableImmediately = parseBoolean(availableImmediately);
    existingProperty.noticePeriod = noticePeriod || "";
    existingProperty.leaseDuration = leaseDuration || "";
    existingProperty.rentNegotiable = parseBoolean(rentNegotiable);
    existingProperty.sharingType = sharingType || "NONE";

    existingProperty.foodDetails = {
      vegFood: parseBoolean(parsedFoodDetails.vegFood),
      nonVegFood: parseBoolean(parsedFoodDetails.nonVegFood),
      breakfastIncluded: parseBoolean(parsedFoodDetails.breakfastIncluded),
      lunchIncluded: parseBoolean(parsedFoodDetails.lunchIncluded),
      dinnerIncluded: parseBoolean(parsedFoodDetails.dinnerIncluded),
    };

    existingProperty.electricityIncluded = parseBoolean(electricityIncluded);
    existingProperty.waterIncluded = parseBoolean(waterIncluded);
    existingProperty.extraCharges = Number(extraCharges) || 0;

    existingProperty.securityFeatures = parsedSecurityFeatures;
    existingProperty.nearbyEssentials = parsedNearbyEssentials;

    existingProperty.facing = facing || "NONE";
    existingProperty.parkingType = parkingType || "NONE";

    existingProperty.workFriendly = parseBoolean(workFriendly);
    existingProperty.highSpeedInternet = parseBoolean(highSpeedInternet);
    existingProperty.couplesAllowed = parseBoolean(couplesAllowed);
    existingProperty.studentsAllowed = parseBoolean(studentsAllowed);
    existingProperty.workingProfessionalsAllowed = parseBoolean(
      workingProfessionalsAllowed,
    );

    existingProperty.propertyAge = propertyAge || "UNKNOWN";
    existingProperty.balconyView = balconyView || "NONE";
    existingProperty.ownerInstructions = ownerInstructions || "";

    existingProperty.images = updatedImages;

    await existingProperty.save();

    return res.status(200).json({
      success: true,
      message: "Property updated successfully",
      data: existingProperty,
    });
  } catch (error) {
    console.error("UPDATE PROPERTY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    await Property.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PROPERTY ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const togglePropertyStatus = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    property.isActive = !property.isActive;
    await property.save();

    return res.status(200).json({
      success: true,
      message: `Property marked as ${property.isActive ? "active" : "inactive"}`,
      data: property,
    });
  } catch (error) {
    console.error("TOGGLE PROPERTY STATUS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getActiveListings = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const filter = {
      isActive: true,
      approvalStatus: "APPROVED",
    };

    const total = await Property.countDocuments(filter);

    await Property.updateMany(
      {
        isFeatured: true,
        featuredUntil: { $lt: new Date() },
      },
      {
        $set: {
          isFeatured: false,
          boostPlan: "NONE",
          featuredUntil: null,
        },
      },
    );

    const properties = await Property.find(filter)
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("owner", "name email");

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    console.error("GET ACTIVE LISTINGS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllPropertiesAdmin = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    console.error("ADMIN GET PROPERTIES ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const approveProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: "APPROVED", rejectionReason: "" },
      { new: true },
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    //Notification
    await Notification.create({
      receiver: property.owner,
      sender: req.user.id,
      property: property._id,
      type: "PROPERTY_APPROVED",
      title: "Property Approved",
      message: `Your property "${property.title}" has been approved by admin.`,
    });

    return res.status(200).json({
      success: true,
      message: "Property approved",
      data: property,
    });
  } catch (error) {
    console.error("APPROVE ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const rejectProperty = async (req, res) => {
  try {
    const { reason } = req.body;

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: "REJECTED",
        rejectionReason: reason || "",
      },
      { new: true },
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Notification
    await Notification.create({
      receiver: property.owner,
      sender: req.user.id,
      property: property._id,
      type: "PROPERTY_REJECTED",
      title: "Property Rejected",
      message: `Your property "${property.title}" has been rejected. Reason: ${
        reason || "No reason provided"
      }`,
    });

    return res.status(200).json({
      success: true,
      message: "Property rejected",
      data: property,
    });
  } catch (error) {
    console.error("REJECT ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deletePropertyAdmin = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    //  Notification (before delete)
    await Notification.create({
      receiver: property.owner,
      sender: req.user.id,
      property: property._id,
      type: "PROPERTY_DELETED",
      title: "Property Deleted",
      message: `Your property "${property.title}" has been deleted by admin.`,
    });

    await Property.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Property deleted by admin",
    });
  } catch (error) {
    console.error("DELETE ADMIN PROPERTY ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getRelatedProperties = async (req, res) => {
  try {
    const currentProperty = await Property.findById(req.params.id);

    if (!currentProperty) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const relatedProperties = await Property.find({
      _id: { $ne: currentProperty._id },
      city: currentProperty.city,
      propertyType: currentProperty.propertyType,
      isActive: true,
      approvalStatus: "APPROVED",
    })
      .sort({ createdAt: -1 })
      .limit(4);

    return res.status(200).json({
      success: true,
      count: relatedProperties.length,
      data: relatedProperties,
    });
  } catch (error) {
    console.error("GET RELATED PROPERTIES ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const propertyId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.wishlist) {
      user.wishlist = [];
    }

    const isAlreadySaved = user.wishlist.some(
      (id) => id.toString() === propertyId,
    );

    if (isAlreadySaved) {
      //Remove from wishlist
      user.wishlist = user.wishlist.filter(
        (id) => id.toString() !== propertyId,
      );

      await Property.findByIdAndUpdate(propertyId, {
        $inc: { wishlistCount: -1 },
      });
    } else {
      //Add to wishlist
      user.wishlist.push(propertyId);

      await Property.findByIdAndUpdate(propertyId, {
        $inc: { wishlistCount: 1 },
      });
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: isAlreadySaved ? "Removed from wishlist" : "Added to wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("WISHLIST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      count: user.wishlist.length,
      data: user.wishlist,
    });
  } catch (error) {
    console.error("GET WISHLIST ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const isInWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const exists = user.wishlist?.some((id) => id.toString() === req.params.id);

    return res.status(200).json({
      success: true,
      exists: Boolean(exists),
    });
  } catch (error) {
    console.error("IS IN WISHLIST ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const activateBoost = async (req, res) => {
  try {
    const { plan } = req.body;
    const property = await Property.findById(req.id.params);

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    let durationDays = 0;

    if (plan === "BASIC") {
      durationDays = 3;
    } else if (plan === "PREMIUM") {
      durationDays = 7;
    } else if (plan === "ELITE") {
      durationDays = 15;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid boost plan",
      });
    }

    const featuredUntil = new Date();

    featuredUntil.setDate(featuredUntil.getDate() + durationDays);

    property.isFeatured = true;
    property.boostPlan = plan;
    property.featuredUntil = featuredUntil;

    await property.save();

    return res.status(200).json({
      success: true,
      message: `${plan} Boost activted successfully`,
      data: property,
    });
  } catch (error) {
    console.error("BOOST ACTIVATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createProperty,
  getMyProperties,
  getSingleProperty,
  getPropertyAnalytics,
  updateProperty,
  deleteProperty,
  togglePropertyStatus,
  getActiveListings,
  getAllPropertiesAdmin,
  approveProperty,
  rejectProperty,
  deletePropertyAdmin,
  getRelatedProperties,
  toggleWishlist,
  getWishlist,
  isInWishlist,
  activateBoost,
};

const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    propertyType: {
      type: String,
      enum: ["FLAT", "PG", "ROOM"],
      required: true,
    },

    listingFor: {
      type: String,
      enum: ["RENT", "SALE"],
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    fullAddress: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    pinCode: {
      type: String,
      trim: true,
    },

    nearbyLandmark: {
      type: String,
      trim: true,
    },

    bhk: {
      type: String,
      required: true,
      trim: true,
    },

    floor: {
      type: String,
      trim: true,
    },

    totalFloors: {
      type: String,
      trim: true,
    },

    area: {
      type: Number,
      required: true,
    },

    furnishing: {
      type: String,
      enum: ["UNFURNISHED", "FURNISHED", "SEMI_FURNISHED"],
      default: "UNFURNISHED",
    },

    roomFeatures: {
      acType: {
        type: String,
        enum: ["AC", "NON_AC"],
        default: "NON_AC",
      },

      attachedBathroom: {
        type: Boolean,
        default: false,
      },

      balcony: {
        type: Boolean,
        default: false,
      },
    },

    amenities: {
      type: [String],
      default: [],
    },

    tenantPreference: {
      type: String,
      enum: ["BOYS", "GIRLS", "FAMILY", "ANYONE"],
      default: "ANYONE",
    },

    availableImmediately: {
      type: Boolean,
      default: false,
    },

    noticePeriod: {
      type: String,
      default: "",
    },

    leaseDuration: {
      type: String,
      default: "",
    },

    rentNegotiable: {
      type: Boolean,
      default: false,
    },

    sharingType: {
      type: String,
      enum: ["PRIVATE", "DOUBLE", "TRIPLE", "FOUR_PLUS", "NONE"],
      default: "NONE",
    },

    foodDetails: {
      vegFood: {
        type: Boolean,
        default: false,
      },
      nonVegFood: {
        type: Boolean,
        default: false,
      },
      breakfastIncluded: {
        type: Boolean,
        default: false,
      },
      lunchIncluded: {
        type: Boolean,
        default: false,
      },
      dinnerIncluded: {
        type: Boolean,
        default: false,
      },
    },

    electricityIncluded: {
      type: Boolean,
      default: false,
    },

    waterIncluded: {
      type: Boolean,
      default: false,
    },

    extraCharges: {
      type: Number,
      default: 0,
    },

    securityFeatures: {
      type: [String],
      default: [],
    },

    nearbyEssentials: {
      type: [String],
      default: [],
    },

    facing: {
      type: String,
      enum: [
        "EAST",
        "WEST",
        "NORTH",
        "SOUTH",
        "NORTH_EAST",
        "NORTH_WEST",
        "SOUTH_EAST",
        "SOUTH_WEST",
        "NONE",
      ],
      default: "NONE",
    },

    parkingType: {
      type: String,
      enum: ["NONE", "BIKE", "CAR", "BOTH"],
      default: "NONE",
    },

    workFriendly: {
      type: Boolean,
      default: false,
    },

    highSpeedInternet: {
      type: Boolean,
      default: false,
    },

    couplesAllowed: {
      type: Boolean,
      default: false,
    },

    studentsAllowed: {
      type: Boolean,
      default: false,
    },

    workingProfessionalsAllowed: {
      type: Boolean,
      default: false,
    },

    propertyAge: {
      type: String,
      enum: ["NEW", "ONE_TO_THREE", "THREE_TO_FIVE", "FIVE_PLUS", "UNKNOWN"],
      default: "UNKNOWN",
    },

    balconyView: {
      type: String,
      enum: ["GARDEN_VIEW", "CITY_VIEW", "ROAD_VIEW", "NONE"],
      default: "NONE",
    },

    ownerInstructions: {
      type: String,
      trim: true,
      default: "",
    },

    rules: {
      smokingAllowed: {
        type: Boolean,
        default: false,
      },
      drinkingAllowed: {
        type: Boolean,
        default: false,
      },
      visitorAllowed: {
        type: Boolean,
        default: false,
      },
    },

    depositAmount: {
      type: Number,
      default: 0,
    },

    maintenanceCharges: {
      type: Number,
      default: 0,
    },

    availableFrom: {
      type: Date,
    },

    minimumStay: {
      type: String,
      default: "",
    },

    floorNumber: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    images: [
      {
        type: String,
        trim: true,
      },
    ],

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },

    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],

    averageRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    views: {
      type: Number,
      default: 0,
    },

    uniqueViews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    inquiryCount: {
      type: Number,
      default: 0,
    },

    wishlistCount: {
      type: Number,
      default: 0,
    },

    visitCount: {
      type: Number,
      default: 0,
    },

    chatCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },

    featuredUntil: {
      type: Date,
      default: null,
    },

    boostPlan: {
      type: String,
      enum: ["NONE", "BASIC", "PREMIUM", "ELITE"],
      default: "NONE",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Property", propertySchema);

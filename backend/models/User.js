const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },

    //password only required for LOCAL users
    password: {
      type: String,
      required: function () {
        return this.authProvider === "LOCAL";
      },
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    userType: {
      type: String,
      enum: ["OWNER", "AGENT"],
      default: "OWNER",
    },

    //NEW: auth provider
    authProvider: {
      type: String,
      enum: ["LOCAL", "GOOGLE"],
      default: "LOCAL",
    },

    //NEW: google id
    googleId: {
      type: String,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },

    //NEW: email verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // System role
    role: {
      type: String,
      enum: ["ADMIN", "SUB_ADMIN", "USER"],
      default: "USER",
    },

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    otp: String,
    otpExpire: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);

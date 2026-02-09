const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // e.g. "Bangalore Office"
      trim: true,
    },

    address: {
      type: String,
      default: "",
    },

    coordinates: {
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180,
      },
    },

    // allowed distance from this site (in meters)
    radiusInMeters: {
      type: Number,
      required: true,
      min: 10, // prevent nonsense values
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Location", LocationSchema);

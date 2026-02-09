const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImageUrl: { type: String, default: null },

    role: {
      type: String,
      enum: ["superadmin", "admin", "member"],
      default: "member",
    },

    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    phone: { type: String, default: "" },
    skills: { type: [String], default: [] },

    experience: {
      currentOrgYears: { type: Number, default: 0 },
      overallYears: { type: Number, default: 0 },
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
    },

    emailVerificationExpires: {
      type: Date,
    },

    analytics: {
      tasksCompleted: { type: Number, default: 0 },
      onTimePercentage: { type: Number, default: 0 },
      avgDelayMinutes: { type: Number, default: 0 },
      avgWorkingHours: {
        weekly: { type: Number, default: 0 },
        monthly: { type: Number, default: 0 },
        yearly: { type: Number, default: 0 },
      },
    },

    assignedLocations: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Location",
        },
      ],
      validate: {
        validator: function (v) {
          return v.length <= 5;
        },
        message: "A user can be assigned a maximum of 5 locations",
      },
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);

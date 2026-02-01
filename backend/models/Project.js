const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    // Project Name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional Description
    description: {
      type: String,
      default: "",
    },

    // Project Status
    status: {
      type: String,
      enum: ["Active", "Completed", "On Hold"],
      default: "Active",
    },

    // Project Owner (Admin who created it)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Members working in this project
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Optional Start & End Dates
    startDate: {
      type: Date,
      default: Date.now,
    },

    endDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);

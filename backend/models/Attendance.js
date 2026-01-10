const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    punchIn: {
      time: Date,
      location: {
        latitude: Number,
        longitude: Number,
      },
      distance: Number,
    },

    punchOut: {
      time: Date,
      location: {
        latitude: Number,
        longitude: Number,
      },
      distance: Number,
    },

    status: {
      type: String,
      enum: ["WFO", "WFH"],
    },

    totalDurationMinutes: Number, // calculated on punch out
  },
  { timestamps: true }
);

AttendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", AttendanceSchema);

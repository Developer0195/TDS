const mongoose = require("mongoose");

const weeklySubtaskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
});

const weeklyTaskSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },

    status: {
      type: String,
      enum: ["Pending", "Submitted", "Approved", "Rejected"],
      default: "Pending",
    },

    subtasks: [weeklySubtaskSchema],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    weekStart: { type: Date, required: true }, // 🔥 important
    weekEnd: { type: Date, required: true },   // 🔥 important
  },
  { timestamps: true }
);

module.exports = mongoose.model("WeeklyTask", weeklyTaskSchema);

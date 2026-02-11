const mongoose = require("mongoose");

/* ===============================
   SUBTASK Schema
================================ */
const subTaskSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },

  completed: {
    type: Boolean,
    default: false,
  },

  completedAt: {
    type: Date,
    default: null, // ✅ KEY FIELD
  },

  // One assignee per subtask
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  document: {
    fileName: {
      type: String,
    },
    fileUrl: {
      type: String,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  
});

/* ===============================
   COMMENT Schema
================================ */
const commentSchema = new mongoose.Schema({
  message: { type: String, required: true },
  commentedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

/* ===============================
   LOG Schema
================================ */
const logSchema = new mongoose.Schema({
  action: { type: String, required: true },
  description: String,
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: { type: Date, default: Date.now },
});

/* ===============================
   TASK Schema
================================ */
const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },

    // ✅ Optional Project Reference
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "In Review", "Completed", "OnHold"],
      default: "Pending",
    },

    // ✅ Deadline Date
    dueDate: {
      type: Date,
      required: true,
    },

    // ✅ REQUIRED Estimated Hours
    estimatedHours: {
      type: Number,
      required: true,  // ✅ MUST be entered
      min: 1,
    },

    // Task Assigned Members (main task)
    assignedTo: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    attachments: [
      {
        url: String,
        name: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    completedAt: {
      type: Date,
      default: null,
    },


    // ✅ Subtasks (each can have its own assignee)
    todoCheckList: [subTaskSchema],

    progress: { type: Number, default: 0 },

    comments: [commentSchema],

    logs: [logSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);

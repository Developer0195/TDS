const mongoose = require("mongoose");

// Todo Checklist Schema
const todoSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
});

// Comment Schema
const commentSchema = new mongoose.Schema({
    message: { type: String, required: true },
    commentedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: { type: Date, default: Date.now },
});

// Activity Log Schema
const logSchema = new mongoose.Schema({
    action: { type: String, required: true },
    description: String,
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    createdAt: { type: Date, default: Date.now },
});


// Task Schema
const taskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        priority: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium",
        },
        status: {
            type: String,
            enum: ["Pending",
                "In Progress",
                "In Review",   // ✅ NEW
                "Completed",
                "Blocked",],
            default: "Pending",
        },
        dueDate: { type: Date, required: true },

        assignedTo: [
            { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        ],

        // Admin who created the task
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        attachments: [
            {
                url: String,
                name: String,
                uploadedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        todoCheckList: [todoSchema],
        progress: { type: Number, default: 0 },
        comments: [commentSchema], // ✅ NEW
        logs: [logSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);

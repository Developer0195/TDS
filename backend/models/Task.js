const mongoose = require("mongoose");

// Todo Checklist Schema
const todoSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
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
            enum: ["Pending", "In Progress", "Completed"],
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
    },
    { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);

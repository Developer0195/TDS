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
        phone: { type: String, default: "" },
        skills: { type: [String], default: [] },

        experience: {
            currentOrgYears: { type: Number, default: 0 },
            overallYears: { type: Number, default: 0 },
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
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);

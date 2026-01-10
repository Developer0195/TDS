const Task = require("../models/Task");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
// @desc Get all users(Admin only)
// @route GET / api / users /
// @access Private (Admin)

const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: "member" })
            .select("-password");

        const usersWithTaskCounts = await Promise.all(
            users.map(async (user) => {
                const pendingTasks = await Task.countDocuments({
                    assignedTo: user._id,
                    status: "Pending",
                });

                const inProgressTasks = await Task.countDocuments({
                    assignedTo: user._id,
                    status: "In Progress",
                });

                const completedTasks = await Task.countDocuments({
                    assignedTo: user._id,
                    status: "Completed",
                });

                return {
                    ...user._doc,

                    // existing counts (UI already uses these)
                    pendingTasks,
                    inProgressTasks,
                    completedTasks,

                    // ✅ ensure analytics always exists
                    analytics: user.analytics || {
                        tasksCompleted: completedTasks,
                        onTimePercentage: 0,
                        avgDelayMinutes: 0,
                        avgWorkingHours: {
                            weekly: 0,
                            monthly: 0,
                            yearly: 0,
                        },
                    },
                };
            })
        );

        res.json(usersWithTaskCounts);
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};


// @desc Get user by ID
// @route GET / api / users /: id
// @access Private
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "user not found" })
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
};

// @desc Delete a user (Admin only)
// @route DELETE /api/users/:id
// @access Private (Admin)
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prevent deleting admin users
        if (user.role === "admin") {
            return res.status(400).json({
                message: "Admin users cannot be deleted",
            });
        }

        // ❗ Check if user has any task in progress
        const inProgressTaskExists = await Task.exists({
            assignedTo: userId,
            status: "In Progress",
        });

        if (inProgressTaskExists) {
            return res.status(400).json({
                message:
                    "User cannot be deleted because they have tasks in progress",
            });
        }

        // Optional: delete user's tasks (Pending / Completed only)
        // await Task.deleteMany({ assignedTo: userId });

        // Delete user
        await user.deleteOne();

        res.json({
            message: "User deleted successfully",
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

// @desc Get logged-in user's profile
// @route GET /api/users/me/profile
// @access Private
const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

// @desc Update logged-in user's profile (restricted fields)
// @route PUT /api/users/me/profile
// @access Private
const updateMyProfile = async (req, res) => {
    try {
        // Only allow these fields to be updated by user
        const allowedFields = ["name", "phone", "skills"];

        const updates = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true }
        ).select("-password");

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};


module.exports = {
    getUsers,
    getUserById,
    deleteUser,
    getMyProfile,
    updateMyProfile,
};
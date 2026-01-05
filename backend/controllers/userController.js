const Task = require("../models/Task");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
// @desc Get all users(Admin only)
// @route GET / api / users /
// @access Private (Admin)

const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: "member" }).select("-password");

        // Add task counts to each user
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
                    ...user._doc, // Include all existing user data
                    pendingTasks,
                    inProgressTasks,
                    completedTasks,
                };
            }));
        res.json(usersWithTaskCounts);
    } catch (error) {
        res.status(500) - json({ message: "Server error", error: error.message });
    }
}
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


module.exports = { getUsers, getUserById, deleteUser };
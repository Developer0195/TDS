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


// @desc Get logged-in admin's team members
// @route GET /api/users/team
// @access Private (Admin)
const getAdminTeamMembers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const admin = await User.findById(req.user._id).select("teamMembers");

    const members = await User.find({
      _id: { $in: admin.teamMembers },
    }).select("name email profileImageUrl");

    const membersWithStats = await Promise.all(
      members.map(async (member) => {
        const pending = await Task.countDocuments({
          assignedTo: member._id,
          status: "Pending",
        });

        const inProgress = await Task.countDocuments({
          assignedTo: member._id,
          status: "In Progress",
        });

        const inReview = await Task.countDocuments({
          assignedTo: member._id,
          status: "In Review",
        });

        const completedTasks = await Task.find({
          assignedTo: member._id,
          status: "Completed",
        });

        const completed = completedTasks.length;

        const onTimeCompleted = completedTasks.filter(
          (t) => t.completedAt && t.completedAt <= t.dueDate
        ).length;

        const onTimeCompletionRate =
          completed === 0
            ? 0
            : Math.round((onTimeCompleted / completed) * 100);

        return {
          ...member._doc,
          taskCounts: {
            pending,
            inProgress,
            inReview,
            completed,
          },
          onTimeCompletionRate,
        };
      })
    );

    res.json(membersWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/users/search
// @access Private (Admin)
const searchUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { search = "" } = req.query;

    const users = await User.find({
      role: "member",
      name: { $regex: search, $options: "i" },
    }).select("name email profileImageUrl");

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





// @desc Add a team member to admin
// @route POST /api/users/team
// @access Private (Admin)
const addTeamMember = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({ message: "Member ID is required" });
    }

    if (memberId === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot add yourself" });
    }

    const member = await User.findById(memberId);
    if (!member || member.role !== "member") {
      return res.status(400).json({ message: "Invalid team member" });
    }

    const admin = await User.findById(req.user._id);

    // prevent duplicates
    if (admin.teamMembers.includes(memberId)) {
      return res.status(400).json({ message: "User already in team" });
    }

    admin.teamMembers.push(memberId);
    await admin.save();

    res.json({
      message: "Team member added successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// @desc Remove a team member from admin
// @route DELETE /api/users/team/:memberId
// @access Private (Admin)
const removeTeamMember = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { memberId } = req.params;

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { teamMembers: memberId },
    });

    res.json({
      message: "Team member removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.params.id;
    const {
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    let filter = { assignedTo: userId };

    // ✅ Date filter (by due date)
    if (startDate && endDate) {
      filter.dueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    /* ---------------- ALL TASKS FOR STATS ---------------- */
    const allTasks = await Task.find(filter);

    const stats = {
      totalTasks: allTasks.length,
      pendingTasks: allTasks.filter(t => t.status === "Pending").length,
      inProgressTasks: allTasks.filter(t => t.status === "In Progress").length,
      inReviewTasks: allTasks.filter(t => t.status === "In Review").length,
      completedTasks: allTasks.filter(t => t.status === "Completed").length,
      onHoldTasks: allTasks.filter(t => t.status === "On Hold").length,
    };

    // ✅ On-time completion rate
    const completedOnTime = allTasks.filter(
      t =>
        t.status === "Completed" &&
        t.completedAt &&
        t.dueDate &&
        t.completedAt <= t.dueDate
    ).length;

    const onTimeCompletionRate = stats.completedTasks
      ? Math.round((completedOnTime / stats.completedTasks) * 100)
      : 0;

    /* ---------------- CHARTS ---------------- */
    const charts = {
      taskDistribution: {
        Pending: stats.pendingTasks,
        "In Progress": stats.inProgressTasks,
        "In Review": stats.inReviewTasks,
        Completed: stats.completedTasks,
        "On Hold": stats.onHoldTasks,
      },
      taskPriorityLevels: {
        Low: allTasks.filter(t => t.priority === "Low").length,
        Medium: allTasks.filter(t => t.priority === "Medium").length,
        High: allTasks.filter(t => t.priority === "High").length,
      },
    };

    /* ---------------- PAGINATED TASKS ---------------- */
    const paginatedTasks = await Task.find(filter)
      .sort({ createdAt: -1 }) // ✅ latest → oldest
      .skip(skip)
      .limit(limitNum)
      .populate("assignedTo", "name email")
      .populate("project", "name");

    const totalPages = Math.ceil(allTasks.length / limitNum);

    res.json({
      statistics: {
        ...stats,
        onTimeCompletionRate,
      },
      charts,
      tasks: paginatedTasks,
      pagination: {
        totalItems: allTasks.length,
        currentPage: pageNum,
        totalPages,
        pageSize: limitNum,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




module.exports = {
    getUsers,
    getUserById,
    deleteUser,
    getMyProfile,
    updateMyProfile,
    getAdminTeamMembers,
  addTeamMember,
  searchUsers,
  removeTeamMember,
  getUserAnalytics
};
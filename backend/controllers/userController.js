const Task = require("../models/Task");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
// @desc Get all users(Admin only)
// @route GET / api / users /
// @access Private (Admin)

// const getUsers = async (req, res) => {
//   try {
//     const users = await User.find({
//       role: "member",
//       emailVerified: true,
//     }).select("-password");

//     const usersWithTaskCounts = await Promise.all(
//       users.map(async (user) => {
//         const pendingTasks = await Task.countDocuments({
//           assignedTo: user._id,
//           status: "Pending",
//         });

//         const inProgressTasks = await Task.countDocuments({
//           assignedTo: user._id,
//           status: "In Progress",
//         });

//         const completedTasks = await Task.countDocuments({
//           assignedTo: user._id,
//           status: "Completed",
//         });

//         return {
//           ...user._doc,

//           // existing counts (UI already uses these)
//           pendingTasks,
//           inProgressTasks,
//           completedTasks,

//           // ✅ ensure analytics always exists
//           analytics: user.analytics || {
//             tasksCompleted: completedTasks,
//             onTimePercentage: 0,
//             avgDelayMinutes: 0,
//             avgWorkingHours: {
//               weekly: 0,
//               monthly: 0,
//               yearly: 0,
//             },
//           },
//         };
//       }),
//     );

//     res.json(usersWithTaskCounts);
//   } catch (error) {
//     res.status(500).json({
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };


// const getUsers = async (req, res) => {
//   try {

//     const users = await User.find({
//       role: { $in: ["member"] },
//       emailVerified: true,
//     }).select("-password");

//     const usersWithStats = await Promise.all(
//       users.map(async (user) => {
//         const pending = await Task.countDocuments({
//           assignedTo: user._id,
//           status: "Pending",
//         });

//         const inProgress = await Task.countDocuments({
//           assignedTo: user._id,
//           status: "In Progress",
//         });

//         const inReview = await Task.countDocuments({
//           assignedTo: user._id,
//           status: "In Review",
//         });

//         const completedTasks = await Task.find({
//           assignedTo: user._id,
//           status: "Completed",
//         }).select("completedAt dueDate");

//         const completed = completedTasks.length;

//         const onTimeCompleted = completedTasks.filter(
//           (t) =>
//             t.completedAt &&
//             t.dueDate &&
//             t.completedAt <= t.dueDate
//         ).length;

//         const onTimeCompletionRate =
//           completed === 0
//             ? 0
//             : Math.round((onTimeCompleted / completed) * 100);

//         return {
//           ...user._doc,

//           taskCounts: {
//             pending,
//             inProgress,
//             inReview,
//             completed,
//           },

//           onTimeCompletionRate,

//           analytics: user.analytics || {
//             tasksCompleted: completed,
//             onTimePercentage: onTimeCompletionRate,
//             avgDelayMinutes: 0,
//             avgWorkingHours: {
//               weekly: 0,
//               monthly: 0,
//               yearly: 0,
//             },
//           },
//         };
//       }),
//     );

//     res.json(usersWithStats);
//   } catch (error) {
//     res.status(500).json({
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

const getUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ["member"] },
      emailVerified: true,
    }).select("-password");

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        /* ===============================
           1️⃣ TASK STATUS COUNTS (TASK LEVEL)
           =============================== */

        const [pending, inProgress, inReview] = await Promise.all([
          Task.countDocuments({
            assignedTo: user._id,
            status: "Pending",
          }),
          Task.countDocuments({
            assignedTo: user._id,
            status: "In Progress",
          }),
          Task.countDocuments({
            assignedTo: user._id,
            status: "In Review",
          }),
        ]);

        /* ===============================
           2️⃣ SUBTASK PERFORMANCE (SUBTASK LEVEL)
           =============================== */

        const tasks = await Task.find({
          "todoCheckList.assignedTo": user._id,
        }).select("todoCheckList dueDate");

        let totalAssignedSubtasks = 0;
        let completedSubtasks = 0;
        let onTimeCompleted = 0;
        let totalDelayMinutes = 0;

        tasks.forEach((task) => {
          task.todoCheckList.forEach((subtask) => {
            if (
              subtask.assignedTo &&
              subtask.assignedTo.toString() === user._id.toString()
            ) {
              totalAssignedSubtasks++;

              if (subtask.completed) {
                completedSubtasks++;

                if (subtask.completedAt && task.dueDate) {
                  const completedAt = new Date(subtask.completedAt);
                  const dueDate = new Date(task.dueDate);

                  if (completedAt <= dueDate) {
                    onTimeCompleted++;
                  } else {
                    const delayMinutes =
                      (completedAt - dueDate) / (1000 * 60);
                    totalDelayMinutes += delayMinutes;
                  }
                }
              }
            }
          });
        });

        /* ===============================
           3️⃣ CALCULATIONS
           =============================== */

        const onTimeCompletionRate =
          completedSubtasks === 0
            ? 0
            : Math.round(
                (onTimeCompleted / completedSubtasks) * 100
              );

        const avgDelayMinutes =
          completedSubtasks === 0
            ? 0
            : Math.round(totalDelayMinutes / completedSubtasks);

        /* ===============================
           RETURN USER WITH STATS
           =============================== */

        return {
          ...user._doc,

          taskCounts: {
            pending,
            inProgress,
            inReview,
            completed: completedSubtasks, // subtask-level completion
          },

          onTimeCompletionRate,

          analytics: {
            totalAssignedSubtasks,
            completedSubtasks,
            onTimePercentage: onTimeCompletionRate,
            avgDelayMinutes,
            avgWorkingHours: {
              weekly: 0,
              monthly: 0,
              yearly: 0,
            },
          },
        };
      })
    );

    res.status(200).json(usersWithStats);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getAllUsersForSuperadmin = async (req, res) => {
  try {
    /* ================= ROLE CHECK ================= */
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        message: "Access denied. Superadmin only.",
      });
    }

    /* ================= FETCH USERS ================= */
    const users = await User.find({
      role: { $in: ["admin", "member"] },
      emailVerified: true,
    })
      .select("-password")
      .lean();

    /* ================= ADD TASK STATS ================= */
    const usersWithStats = await Promise.all(
      users.map(async (user) => {

        /* ===============================
           1️⃣ TASK-LEVEL COUNTS
           =============================== */
        const [
          pending,
          inProgress,
          inReview,
          completedTasks
        ] = await Promise.all([
          Task.countDocuments({ assignedTo: user._id, status: "Pending" }),
          Task.countDocuments({ assignedTo: user._id, status: "In Progress" }),
          Task.countDocuments({ assignedTo: user._id, status: "In Review" }),
          Task.find({ assignedTo: user._id, status: "Completed" }).select("_id"),
        ]);

        const completed = completedTasks.length; // ✅ task-level

        /* ===============================
           2️⃣ SUBTASK PERFORMANCE (FOR %)
           =============================== */
        const tasksWithSubtasks = await Task.find({
          "todoCheckList.assignedTo": user._id,
        }).select("todoCheckList dueDate");

        let completedSubtasks = 0;
        let onTimeCompleted = 0;

        tasksWithSubtasks.forEach((task) => {
          task.todoCheckList.forEach((subtask) => {
            if (
              subtask.assignedTo &&
              subtask.assignedTo.toString() === user._id.toString() &&
              subtask.completed
            ) {
              completedSubtasks++;

              if (subtask.completedAt && task.dueDate) {
                if (
                  new Date(subtask.completedAt) <= new Date(task.dueDate)
                ) {
                  onTimeCompleted++;
                }
              }
            }
          });
        });

        const onTimeCompletionRate =
          completedSubtasks === 0
            ? 0
            : Math.round(
                (onTimeCompleted / completedSubtasks) * 100
              );

        return {
          ...user,

          taskCounts: {
            pending,
            inProgress,
            inReview,
            completed, // ✅ correct task-level number
          },

          onTimeCompletionRate, // ✅ subtask-based fairness
        };
      })
    );

    res.status(200).json({
      users: usersWithStats,
    });

  } catch (error) {
    console.error("Superadmin users fetch error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};


const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "user not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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
        message: "User cannot be deleted because they have tasks in progress",
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

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select("-password");

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
// const getAdminTeamMembers = async (req, res) => {
//   try {
//     if (req.user.role !== "admin") {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     const admin = await User.findById(req.user._id).select("teamMembers");

//     const members = await User.find({
//       _id: { $in: admin.teamMembers },
//     }).select("name email profileImageUrl").populate("assignedLocations", "name address radiusInMeters");

//     const membersWithStats = await Promise.all(
//       members.map(async (member) => {
//         const pending = await Task.countDocuments({
//           assignedTo: member._id,
//           status: "Pending",
//         });

//         const inProgress = await Task.countDocuments({
//           assignedTo: member._id,
//           status: "In Progress",
//         });

//         const inReview = await Task.countDocuments({
//           assignedTo: member._id,
//           status: "In Review",
//         });

//         const completedTasks = await Task.find({
//           assignedTo: member._id,
//           status: "Completed",
//         });

//         const completed = completedTasks.length;

//         const onTimeCompleted = completedTasks.filter(
//           (t) => t.completedAt && t.completedAt <= t.dueDate
//         ).length;

//         const onTimeCompletionRate =
//           completed === 0
//             ? 0
//             : Math.round((onTimeCompleted / completed) * 100);

//         return {
//           ...member._doc,
//            assignedLocations: member.assignedLocations || [],
//           taskCounts: {
//             pending,
//             inProgress,
//             inReview,
//             completed,
//           },
//           onTimeCompletionRate,
//         };
//       })
//     );

//     res.json(membersWithStats);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// const getAdminTeamMembers = async (req, res) => {
//   try {
//     if (req.user.role !== "admin" && req.user.role !== "superadmin") {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     // get admin's team members
//     const admin = await User.findById(req.user._id).select("teamMembers");

//     // fetch members + assigned locations
//     const members = await User.find({
//       _id: { $in: admin.teamMembers },
//     })
//       .select("name email profileImageUrl assignedLocations")
//       .populate("assignedLocations", "name address radiusInMeters");

//     const membersWithStats = await Promise.all(
//       members.map(async (member) => {
//         const pending = await Task.countDocuments({
//           assignedTo: member._id,
//           status: "Pending",
//         });

//         const inProgress = await Task.countDocuments({
//           assignedTo: member._id,
//           status: "In Progress",
//         });

//         const inReview = await Task.countDocuments({
//           assignedTo: member._id,
//           status: "In Review",
//         });

//         const completedTasks = await Task.find({
//           assignedTo: member._id,
//           status: "Completed",
//         }).select("completedAt dueDate");

//         const completed = completedTasks.length;

//         const onTimeCompleted = completedTasks.filter(
//           (t) => t.completedAt && t.dueDate && t.completedAt <= t.dueDate,
//         ).length;

//         const onTimeCompletionRate =
//           completed === 0 ? 0 : Math.round((onTimeCompleted / completed) * 100);

//         return {
//           _id: member._id,
//           name: member.name,
//           email: member.email,
//           profileImageUrl: member.profileImageUrl,

//           // ✅ NEW: assigned locations
//           assignedLocations: member.assignedLocations || [],

//           taskCounts: {
//             pending,
//             inProgress,
//             inReview,
//             completed,
//           },

//           onTimeCompletionRate,
//         };
//       }),
//     );

//     res.json(membersWithStats);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const getAdminTeamMembers = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const admin = await User.findById(req.user._id).select("teamMembers");

    const members = await User.find({
      _id: { $in: admin.teamMembers },
    })
      .select("name email profileImageUrl assignedLocations")
      .populate("assignedLocations", "name address radiusInMeters");

    const membersWithStats = await Promise.all(
      members.map(async (member) => {

        /* ===============================
           1️⃣ TASK LEVEL COUNTS
           =============================== */

        const [
          pending,
          inProgress,
          inReview,
          completedTasks
        ] = await Promise.all([
          Task.countDocuments({
            assignedTo: member._id,
            status: "Pending",
          }),
          Task.countDocuments({
            assignedTo: member._id,
            status: "In Progress",
          }),
          Task.countDocuments({
            assignedTo: member._id,
            status: "In Review",
          }),
          Task.find({
            assignedTo: member._id,
            status: "Completed",
          }).select("_id"),
        ]);

        const completed = completedTasks.length; // ✅ TASK LEVEL

        /* ===============================
           2️⃣ SUBTASK PERFORMANCE (ONLY FOR %)
           =============================== */

        const tasksWithSubtasks = await Task.find({
          "todoCheckList.assignedTo": member._id,
        }).select("todoCheckList dueDate");

        let completedSubtasks = 0;
        let onTimeCompleted = 0;

        tasksWithSubtasks.forEach((task) => {
          task.todoCheckList.forEach((subtask) => {
            if (
              subtask.assignedTo &&
              subtask.assignedTo.toString() === member._id.toString() &&
              subtask.completed
            ) {
              completedSubtasks++;

              if (subtask.completedAt && task.dueDate) {
                if (new Date(subtask.completedAt) <= new Date(task.dueDate)) {
                  onTimeCompleted++;
                }
              }
            }
          });
        });

        const onTimeCompletionRate =
          completedSubtasks === 0
            ? 0
            : Math.round(
                (onTimeCompleted / completedSubtasks) * 100
              );

        return {
          _id: member._id,
          name: member.name,
          email: member.email,
          profileImageUrl: member.profileImageUrl,
          assignedLocations: member.assignedLocations || [],

          taskCounts: {
            pending,
            inProgress,
            inReview,
            completed, // ✅ NOW shows correct number (e.g. 3)
          },

          onTimeCompletionRate, // ✅ Still fair (subtask-based)
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
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
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
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
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

// const getUserAnalytics = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const {
//       startDate,
//       endDate,
//       page = 1,
//       limit = 10,
//     } = req.query;

//     const pageNum = Number(page);
//     const limitNum = Number(limit);
//     const skip = (pageNum - 1) * limitNum;

//     let filter = { assignedTo: userId };

//     // ✅ Date filter (by due date)
//     if (startDate && endDate) {
//       filter.dueDate = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate),
//       };
//     }

//     /* ---------------- ALL TASKS FOR STATS ---------------- */
//     const allTasks = await Task.find(filter);

//     const stats = {
//       totalTasks: allTasks.length,
//       pendingTasks: allTasks.filter(t => t.status === "Pending").length,
//       inProgressTasks: allTasks.filter(t => t.status === "In Progress").length,
//       inReviewTasks: allTasks.filter(t => t.status === "In Review").length,
//       completedTasks: allTasks.filter(t => t.status === "Completed").length,
//       onHoldTasks: allTasks.filter(t => t.status === "On Hold").length,
//     };

//     // ✅ On-time completion rate
//     const completedOnTime = allTasks.filter(
//       t =>
//         t.status === "Completed" &&
//         t.completedAt &&
//         t.dueDate &&
//         t.completedAt <= t.dueDate
//     ).length;

//     const onTimeCompletionRate = stats.completedTasks
//       ? Math.round((completedOnTime / stats.completedTasks) * 100)
//       : 0;

//     /* ---------------- CHARTS ---------------- */
//     const charts = {
//       taskDistribution: {
//         Pending: stats.pendingTasks,
//         "In Progress": stats.inProgressTasks,
//         "In Review": stats.inReviewTasks,
//         Completed: stats.completedTasks,
//         "On Hold": stats.onHoldTasks,
//       },
//       taskPriorityLevels: {
//         Low: allTasks.filter(t => t.priority === "Low").length,
//         Medium: allTasks.filter(t => t.priority === "Medium").length,
//         High: allTasks.filter(t => t.priority === "High").length,
//       },
//     };

//     /* ---------------- PAGINATED TASKS ---------------- */
//     const paginatedTasks = await Task.find(filter)
//       .sort({ createdAt: -1 }) // ✅ latest → oldest
//       .skip(skip)
//       .limit(limitNum)
//       .populate("assignedTo", "name email")
//       .populate("project", "name");

//     const totalPages = Math.ceil(allTasks.length / limitNum);

//     res.json({
//       statistics: {
//         ...stats,
//         onTimeCompletionRate,
//       },
//       charts,
//       tasks: paginatedTasks,
//       pagination: {
//         totalItems: allTasks.length,
//         currentPage: pageNum,
//         totalPages,
//         pageSize: limitNum,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// const getUserAnalytics = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const {
//       startDate,
//       endDate,
//       status,
//       priority,
//       assignedByMe,
//       page = 1,
//       limit = 10,
//     } = req.query;

//     const pageNum = Number(page);
//     const limitNum = Number(limit);
//     const skip = (pageNum - 1) * limitNum;

//     let filter = { assignedTo: userId };

//     // 📅 Due date filter
//     if (startDate && endDate) {
//       filter.dueDate = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate),
//       };
//     }

//     // 🏷 Status filter
//     if (status) filter.status = status;

//     // ⚡ Priority filter
//     if (priority) filter.priority = priority;

//     // 👤 Assigned by me
//     if (assignedByMe === "true") {
//       filter.createdBy = req.user._id;
//     }

//     const allTasks = await Task.find(filter);

//     /* ---------------- STATS ---------------- */
//     const stats = {
//       totalTasks: allTasks.length,
//       pendingTasks: allTasks.filter(t => t.status === "Pending").length,
//       inProgressTasks: allTasks.filter(t => t.status === "In Progress").length,
//       inReviewTasks: allTasks.filter(t => t.status === "In Review").length,
//       completedTasks: allTasks.filter(t => t.status === "Completed").length,
//       onHoldTasks: allTasks.filter(t => t.status === "On Hold").length,
//     };

//     /* ---------------- CHARTS ---------------- */
//     const charts = {
//       taskDistribution: {
//         Pending: stats.pendingTasks,
//         "In Progress": stats.inProgressTasks,
//         "In Review": stats.inReviewTasks,
//         Completed: stats.completedTasks,
//         "On Hold": stats.onHoldTasks,
//       },
//       taskPriorityLevels: {
//         Low: allTasks.filter(t => t.priority === "Low").length,
//         Medium: allTasks.filter(t => t.priority === "Medium").length,
//         High: allTasks.filter(t => t.priority === "High").length,
//       },
//     };

//     /* ---------------- TASK LIST ---------------- */
//     const tasks = await Task.find(filter)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limitNum)
//       .populate("assignedTo", "name email")
//       .populate("createdBy", "name")
//       .populate("project", "name");

//     res.json({
//       statistics: stats,
//       charts,
//       tasks,
//       pagination: {
//         totalItems: allTasks.length,
//         currentPage: pageNum,
//         totalPages: Math.ceil(allTasks.length / limitNum),
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// const getUserAnalytics = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const {
//       startDate,
//       endDate,
//       status,
//       priority,
//       assignedByMe,
//       page = 1,
//       limit = 10,
//     } = req.query;

//     const pageNum = Number(page);
//     const limitNum = Number(limit);
//     const skip = (pageNum - 1) * limitNum;

//     /* ===============================
//        1️⃣ BASE FILTER (GLOBAL)
//        =============================== */
//     const baseFilter = {
//       assignedTo: userId,
//     };

//     // 📅 Due date filter (GLOBAL)
//     if (startDate && endDate) {
//       baseFilter.dueDate = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate),
//       };
//     }

//     /* ===============================
//        2️⃣ RECENT TASKS FILTER
//        =============================== */
//     const recentTasksFilter = {
//       ...baseFilter,
//     };

//     // 🏷 Status → ONLY recent tasks
//     if (status) {
//       recentTasksFilter.status = status;
//     }

//     // ⚡ Priority → ONLY recent tasks
//     if (priority) {
//       recentTasksFilter.priority = priority;
//     }

//     // 👤 Assigned by me → ONLY recent tasks
//     if (assignedByMe === "true") {
//       recentTasksFilter.createdBy = req.user._id;
//     }

//     /* ===============================
//        📊 ALL TASKS (FOR STATS + CHARTS)
//        =============================== */
//     const allTasks = await Task.find(baseFilter);

//     /* ---------------- STATS ---------------- */
//     const stats = {
//       totalTasks: allTasks.length,
//       pendingTasks: allTasks.filter((t) => t.status === "Pending").length,
//       inProgressTasks: allTasks.filter((t) => t.status === "In Progress")
//         .length,
//       inReviewTasks: allTasks.filter((t) => t.status === "In Review").length,
//       completedTasks: allTasks.filter((t) => t.status === "Completed").length,
//       onHoldTasks: allTasks.filter((t) => t.status === "On Hold").length,
//     };

//     /* ---------------- CHARTS ---------------- */
//     const charts = {
//       taskDistribution: {
//         Pending: stats.pendingTasks,
//         "In Progress": stats.inProgressTasks,
//         "In Review": stats.inReviewTasks,
//         Completed: stats.completedTasks,
//         "On Hold": stats.onHoldTasks,
//       },
//       taskPriorityLevels: {
//         Low: allTasks.filter((t) => t.priority === "Low").length,
//         Medium: allTasks.filter((t) => t.priority === "Medium").length,
//         High: allTasks.filter((t) => t.priority === "High").length,
//       },
//     };

//     /* ===============================
//        📋 RECENT TASKS (FILTERED)
//        =============================== */
//     const [tasks, totalRecentTasks] = await Promise.all([
//       Task.find(recentTasksFilter)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limitNum)
//         .populate("assignedTo", "name email")
//         .populate("createdBy", "name")
//         .populate("project", "name"),

//       Task.countDocuments(recentTasksFilter),
//     ]);

//     res.json({
//       statistics: stats,
//       charts,
//       tasks,
//       pagination: {
//         totalItems: totalRecentTasks,
//         currentPage: pageNum,
//         totalPages: Math.ceil(totalRecentTasks / limitNum),
//         pageSize: limitNum,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.params.id;

    const {
      startDate,
      endDate,
      status,
      priority,
      assignedByMe,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    /* =====================================================
       1️⃣ GLOBAL TASK FILTER (FOR KPI + CHARTS)
    ===================================================== */
    const baseFilter = {
      assignedTo: userId,
    };

    if (startDate && endDate) {
      baseFilter.dueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    /* =====================================================
       2️⃣ RECENT TASK FILTER (TABLE ONLY)
    ===================================================== */
    const recentTasksFilter = { ...baseFilter };

    if (status) recentTasksFilter.status = status;
    if (priority) recentTasksFilter.priority = priority;

    if (assignedByMe === "true") {
      recentTasksFilter.createdBy = req.user._id;
    }

    /* =====================================================
       3️⃣ FETCH ALL TASKS FOR KPI + CHARTS
    ===================================================== */
    const allTasks = await Task.find(baseFilter).lean();
    const now = new Date();

    const completedTasks = allTasks.filter(
      (t) => t.status === "Completed"
    );

    const overdueTasks = allTasks.filter(
      (t) =>
        t.status !== "Completed" &&
        t.dueDate &&
        new Date(t.dueDate) < now
    );

    const delayedTasks = completedTasks.filter(
      (t) =>
        t.completedAt &&
        t.dueDate &&
        new Date(t.completedAt) > new Date(t.dueDate)
    );

    const onTimeTasks = completedTasks.filter(
      (t) =>
        t.completedAt &&
        t.dueDate &&
        new Date(t.completedAt) <= new Date(t.dueDate)
    );

    const onTimeCompletionRate =
      completedTasks.length === 0
        ? 0
        : Math.round(
            (onTimeTasks.length / completedTasks.length) * 100
          );

    /* =====================================================
       4️⃣ SUBTASK PERFORMANCE (CORRECT + SYNCHRONIZED)
    ===================================================== */

    const tasksWithSubtasks = await Task.find({
      "todoCheckList.assignedTo": userId,
    }).select("title todoCheckList dueDate");

    let totalSubtasksAssigned = 0;
    let completedSubtasks = 0;
    let pendingSubtasks = 0;
    let onTimeSubtasks = 0;
    let delayedSubtasks = 0;

    const delayedSubtaskDetails = [];

    tasksWithSubtasks.forEach((task) => {
      if (!task.todoCheckList) return;

      task.todoCheckList.forEach((subtask) => {
        if (
          subtask.assignedTo &&
          subtask.assignedTo.toString() === userId.toString()
        ) {
          totalSubtasksAssigned++;

          if (subtask.completed) {
            completedSubtasks++;

            const dueDate = subtask.dueDate || task.dueDate;

            if (dueDate && subtask.completedAt) {
              const completedDate = new Date(subtask.completedAt);
              const due = new Date(dueDate);

              const isDelayed = completedDate > due;

              if (isDelayed) {
                delayedSubtasks++;

                delayedSubtaskDetails.push({
                  taskId: task._id,
                  taskTitle: task.title,
                  subtaskText: subtask.text,
                  dueDate: due,
                  completedAt: completedDate,
                  delayMinutes:
                    (completedDate - due) / 60000,
                });
              } else {
                onTimeSubtasks++;
              }
            }
          } else {
            pendingSubtasks++;
          }
        }
      });
    });

    const subtaskOnTimeRate =
      completedSubtasks === 0
        ? 0
        : Math.round(
            (onTimeSubtasks / completedSubtasks) * 100
          );

    /* =====================================================
       5️⃣ TASK STATUS KPI (UNCHANGED)
    ===================================================== */

    const stats = {
      totalTasks: allTasks.length,
      pendingTasks: allTasks.filter((t) => t.status === "Pending").length,
      inProgressTasks: allTasks.filter((t) => t.status === "In Progress").length,
      inReviewTasks: allTasks.filter((t) => t.status === "In Review").length,
      completedTasks: completedTasks.length,
      onHoldTasks: allTasks.filter((t) => t.status === "On Hold").length,
      overdueTasks: overdueTasks.length,
      delayedTasks: delayedTasks.length,
      onTimeCompletionRate,

      /* 🔥 Separate Subtask Module */
      subtaskStatistics: {
        totalSubtasksAssigned,
        completedSubtasks,
        pendingSubtasks,
        onTimeSubtasks,
        delayedSubtasks,
        subtaskOnTimeRate,
        delayedSubtaskDetails, // 🔥 IMPORTANT FOR MODAL
      },
    };

    /* =====================================================
       6️⃣ CHART DATA
    ===================================================== */

    const charts = {
      taskDistribution: {
        Pending: stats.pendingTasks,
        "In Progress": stats.inProgressTasks,
        "In Review": stats.inReviewTasks,
        Completed: stats.completedTasks,
        "On Hold": stats.onHoldTasks,
        Overdue: stats.overdueTasks,
      },
      taskPriorityLevels: {
        Low: allTasks.filter((t) => t.priority === "Low").length,
        Medium: allTasks.filter((t) => t.priority === "Medium").length,
        High: allTasks.filter((t) => t.priority === "High").length,
      },
    };

    /* =====================================================
       7️⃣ RECENT TASKS (PAGINATED)
    ===================================================== */

    const [tasks, totalRecentTasks] = await Promise.all([
      Task.find(recentTasksFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("assignedTo", "name email")
        .populate("createdBy", "name")
        .populate("project", "name"),

      Task.countDocuments(recentTasksFilter),
    ]);

    /* =====================================================
       8️⃣ RESPONSE
    ===================================================== */

    res.json({
      statistics: stats,
      charts,
      tasks,
      pagination: {
        totalItems: totalRecentTasks,
        currentPage: pageNum,
        totalPages: Math.ceil(totalRecentTasks / limitNum),
        pageSize: limitNum,
      },
    });

  } catch (error) {
    console.error("User analytics error:", error);
    res.status(500).json({ message: error.message });
  }
};





const getAssignableUsers = async (req, res) => {
  try {
    // 🔐 Only admin & superadmin can fetch
    if (!["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find({
      role: { $in: ["admin", "superadmin"] },
    }).select("_id name email role");

    res.json({
      users,
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
  getUserAnalytics,
  getAssignableUsers,
  getAllUsersForSuperadmin
};

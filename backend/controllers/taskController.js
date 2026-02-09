const Task = require("../models/Task");
const addLog = require("../utils/addLogs");

/* ===============================
   GET ALL TASKS
================================ */
// const getTasks = async (req, res) => {
//   try {
//     const { status, projectId } = req.query;
//     let filter = {};

//     if (status) filter.status = status;

//     // ✅ Project Filtering (Loose Tasks Support)
//     if (projectId === "null") {
//       filter.project = null; // Loose tasks
//     } else if (projectId) {
//       filter.project = projectId; // Project tasks
//     }

//     if (req.user.role === "admin") {
//       filter.createdBy = req.user._id;
//     } else if (req.user.role === "member") {
//       filter.assignedTo = req.user._id;
//     }

//     let tasks = await Task.find(filter)
//       .populate("assignedTo", "name email profileImageUrl")
//       .populate("project", "name");

//     tasks = tasks.map((task) => {
//       const completedCount = task.todoCheckList.filter(
//         (t) => t.completed,
//       ).length;
//       return { ...task._doc, completedTodoCount: completedCount };
//     });

//     const baseFilter =
//       req.user.role === "superadmin"
//         ? {}
//         : req.user.role === "admin"
//           ? { createdBy: req.user._id }
//           : { assignedTo: req.user._id };

//     const [
//       allTasks,
//       pendingTasks,
//       inProgressTasks,
//       inReviewTasks,
//       completedTasks,
//       onHoldTasks,
//     ] = await Promise.all([
//       Task.countDocuments(baseFilter),
//       Task.countDocuments({ ...baseFilter, status: "Pending" }),
//       Task.countDocuments({ ...baseFilter, status: "In Progress" }),
//       Task.countDocuments({ ...baseFilter, status: "In Review" }),
//       Task.countDocuments({ ...baseFilter, status: "Completed" }),
//       Task.countDocuments({ ...baseFilter, status: "OnHold" }),
//     ]);

//     res.json({
//       tasks,
//       statusSummary: {
//         all: allTasks,
//         pendingTasks,
//         inProgressTasks,
//         inReviewTasks,
//         completedTasks,
//         onHoldTasks,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


const getTasks = async (req, res) => {
  try {
    const {
      status,
      projectId,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    let filter = {};

    // ✅ Status filter
    if (status) {
      filter.status = status;
    }

    // ✅ Project filter
    if (projectId === "null") {
      filter.project = null;
    } else if (projectId) {
      filter.project = projectId;
    }

    // ✅ Date range filter (due date)
    if (startDate && endDate) {
      filter.dueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // ✅ Role-based access
    if (req.user.role === "admin") {
      filter.createdBy = req.user._id;
    } else if (req.user.role === "member") {
      filter.assignedTo = req.user._id;
    }

    // ✅ Pagination math
    const pageNumber = Number(page);
    const pageSize = Number(limit);
    const skip = (pageNumber - 1) * pageSize;

    // ✅ Fetch paginated tasks + total count
    const [tasks, totalTasks] = await Promise.all([
      Task.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)              // 🔥 pagination
        .limit(pageSize)         // 🔥 pagination
        .populate("assignedTo", "name email profileImageUrl")
        .populate("project", "name"),

      Task.countDocuments(filter),
    ]);

    // ✅ Add completed subtask count
    const formattedTasks = tasks.map((task) => {
      const completedCount = task.todoCheckList.filter(
        (t) => t.completed,
      ).length;

      return {
        ...task._doc,
        completedTodoCount: completedCount,
      };
    });

    res.json({
      tasks: formattedTasks,
      pagination: {
        currentPage: pageNumber,
        pageSize,
        totalItems: totalTasks,
        totalPages: Math.ceil(totalTasks / pageSize),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



/* ===============================
   GET TASK BY ID
================================ */
const getTaskById = async (req, res) => {
  try {
    const filter = { _id: req.params.id };

    if (req.user.role === "admin") {
      filter.createdBy = req.user._id;
    } else if (req.user.role === "member") {
      filter.assignedTo = req.user._id;
    }

    const task = await Task.findOne(filter)
      .populate("assignedTo", "name email profileImageUrl")
      .populate("project", "name description members")
      .populate("comments.commentedBy", "name profileImageUrl")
      // ✅ IMPORTANT: populate subtask assignees
      .populate("todoCheckList.assignedTo", "name email profileImageUrl");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ===============================
   CREATE TASK
================================ */
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      estimatedHours, // ✅ NEW REQUIRED FIELD
      assignedTo,
      project,
      attachments = [],
      todoCheckList = [],
    } = req.body;

    // ✅ Validation
    if (!title || !dueDate || !assignedTo?.length) {
      return res.status(400).json({ message: "Invalid task data" });
    }

    if (!estimatedHours || estimatedHours < 1) {
      return res
        .status(400)
        .json({ message: "Estimated hours is required (min 1 hour)" });
    }

    // ✅ Normalize Subtasks
    const normalizedTodos = todoCheckList.map((t) => ({
      text: t.text || t,
      completed: t.completed ?? false,
      assignedTo: t.assignedTo || null, // ✅ One assignee per subtask
    }));

    // ✅ Create Task
    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      estimatedHours, // ✅ Save Hours
      assignedTo,
      project: project || null,
      createdBy: req.user._id,
      todoCheckList: normalizedTodos,
      attachments,
      logs: [
        {
          action: "TASK_CREATED",
          description: "Task created",
          performedBy: req.user._id,
        },
      ],
    });

    res.status(201).json({ message: "Task created", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   UPDATE TASK
================================ */
const updateTask = async (req, res) => {
  try {
    const filter = { _id: req.params.id };

    if (req.body.estimatedHours && req.body.estimatedHours < 1) {
      return res.status(400).json({
        message: "Estimated hours must be at least 1",
      });
    }

    if (req.user.role === "admin") filter.createdBy = req.user._id;
    else if (req.user.role === "member") filter.assignedTo = req.user._id;

    const task = await Task.findOne(filter);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.body.project === "") {
      req.body.project = null;
    }

    Object.assign(task, req.body);

    addLog(task, "TASK_UPDATED", "Task updated", req.user._id);

    await task.save();
    res.json({ message: "Task updated", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   UPDATE TASK STATUS (ADMIN ONLY COMPLETE)
================================ */
const updateTaskStatus = async (req, res) => {
  try {
    console.log("hi");
    const task = await Task.findById(req.params.id);
    console.log(req.body);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user.role === "member" && req.body.status === "Completed") {
      return res.status(403).json({ message: "Only admin can complete task" });
    }

    task.status = req.body.status;

    addLog(
      task,
      "STATUS_CHANGED",
      `Status changed to ${task.status}`,
      req.user._id,
    );

    await task.save();
    res.json({ message: "Status updated", task });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   UPDATE CHECKLIST
================================ */
const updateTaskChecklist = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    console.log(task);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.todoCheckList = req.body.todoCheckList.map((t) => ({
      text: t.text,
      completed: t.completed ?? false,
      assignedTo: t.assignedTo || null,
    }));

    const completed = task.todoCheckList.filter((t) => t.completed).length;
    const total = task.todoCheckList.length;

    task.progress = total ? Math.round((completed / total) * 100) : 0;

    if (task.progress === 100) {
      task.status = "In Review";
      addLog(task, "TASK_IN_REVIEW", "Moved to In Review", req.user._id);
    } else if (task.progress > 0) {
      task.status = "In Progress";
    } else {
      task.status = "Pending";
    }

    await task.save();
    res.json({ message: "Checklist updated", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

/* ===============================
   ADD COMMENT
================================ */
const addComment = async (req, res) => {
  try {
    const filter = { _id: req.params.id };

    if (req.user.role === "admin") filter.createdBy = req.user._id;
    else if (req.user.role === "member") filter.assignedTo = req.user._id;

    const task = await Task.findOne(filter);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.comments.push({
      message: req.body.message,
      commentedBy: req.user._id,
    });

    addLog(task, "COMMENT_ADDED", "Comment added", req.user._id);

    await task.save();

    const populatedTask = await Task.findById(task._id).populate(
      "comments.commentedBy",
      "name profileImageUrl",
    );

    res.json({ message: "Comment added", task: populatedTask });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   DELETE TASK (ADMIN ONLY)
================================ */
const deleteTask = async (req, res) => {
  try {
    const filter = { _id: req.params.id };

    if (req.user.role === "admin") {
      filter.createdBy = req.user._id;
    } else {
      return res.status(403).json({
        message: "You are not allowed to delete this task",
      });
    }

    const task = await Task.findOne(filter);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.deleteOne();

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
 DASHBOARD DATA (ADMIN / SUPERADMIN)
================================ */
// const getDashboardData = async (req, res) => {
//     try {
//         const { projectId } = req.query;

//         const baseFilter =
//             req.user.role === "superadmin"
//                 ? {}
//                 : { createdBy: req.user._id };

//         if (projectId) baseFilter.project = projectId;

//         const totalTasks = await Task.countDocuments(baseFilter);
//         const pendingTasks = await Task.countDocuments({
//             ...baseFilter,
//             status: "Pending",
//         });
//         const inProgressTasks = await Task.countDocuments({
//             ...baseFilter,
//             status: "In Progress",
//         });
//         const completedTasks = await Task.countDocuments({
//             ...baseFilter,
//             status: "Completed",
//         });
//         const overdueTasks = await Task.countDocuments({
//             ...baseFilter,
//             status: { $ne: "Completed" },
//             dueDate: { $lt: new Date() },
//         });

//         const priorityAgg = await Task.aggregate([
//             { $match: baseFilter },
//             { $group: { _id: "$priority", count: { $sum: 1 } } },
//         ]);

//         const taskPriorityLevels = {
//             Low: priorityAgg.find(p => p._id === "Low")?.count || 0,
//             Medium: priorityAgg.find(p => p._id === "Medium")?.count || 0,
//             High: priorityAgg.find(p => p._id === "High")?.count || 0,
//         };

//         const recentTasks = await Task.find(baseFilter)
//             .sort({ createdAt: -1 })
//             .limit(10)
//             .select("title status priority dueDate createdAt createdBy")
//             .populate("createdBy", "name email");

//         res.status(200).json({
//             statistics: {
//                 totalTasks,
//                 pendingTasks,
//                 inProgressTasks,
//                 completedTasks,
//                 overdueTasks,
//             },
//             charts: {
//                 taskDistribution: {
//                     Pending: pendingTasks,
//                     InProgress: inProgressTasks,
//                     Completed: completedTasks,
//                     All: totalTasks,
//                 },
//                 taskPriorityLevels,
//             },
//             recentTasks,
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

const getDashboardData = async (req, res) => {
  try {
    const { projectId, startDate, endDate, recentStatus, recentPriority,  page = 1,
  limit = 10 } = req.query;

  const pageNumber = Number(page);
const pageSize = Number(limit);
const skip = (pageNumber - 1) * pageSize;


    const baseFilter =
      req.user.role === "superadmin" ? {} : { createdBy: req.user._id };

    if (projectId === "null") {
      baseFilter.project = null; // loose tasks
    } else if (projectId) {
      baseFilter.project = projectId;
    }

    // ✅ Date range filter on dueDate
    if (startDate && endDate) {
      baseFilter.dueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const totalTasks = await Task.countDocuments(baseFilter);

    const pendingTasks = await Task.countDocuments({
      ...baseFilter,
      status: "Pending",
    });

    const inProgressTasks = await Task.countDocuments({
      ...baseFilter,
      status: "In Progress",
    });

    const completedTasks = await Task.countDocuments({
      ...baseFilter,
      status: "Completed",
    });

    const overdueTasks = await Task.countDocuments({
      ...baseFilter,
      status: { $ne: "Completed" },
      dueDate: { $lt: new Date() },
    });

    const inReviewTasks = await Task.countDocuments({
      ...baseFilter,
      status: "In Review",
    });

    const onHoldTasks = await Task.countDocuments({
      ...baseFilter,
      status: "OnHold",
    });

    const priorityAgg = await Task.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    const taskPriorityLevels = {
      Low: priorityAgg.find((p) => p._id === "Low")?.count || 0,
      Medium: priorityAgg.find((p) => p._id === "Medium")?.count || 0,
      High: priorityAgg.find((p) => p._id === "High")?.count || 0,
    };

    const recentTasksFilter = { ...baseFilter };

    if (recentStatus) {
      recentTasksFilter.status = recentStatus;
    }

    if (recentPriority) {
      recentTasksFilter.priority = recentPriority;
    }

   const [recentTasks, totalRecentTasks] = await Promise.all([
  Task.find(recentTasksFilter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .select("title status priority dueDate createdAt project assignedTo")
    .populate("project", "name")
    .populate("assignedTo", "name email profileImageUrl"),

  Task.countDocuments(recentTasksFilter),
]);


    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
        inReviewTasks,
        onHoldTasks,
      },
      charts: {
        taskDistribution: {
          Pending: pendingTasks,
          InProgress: inProgressTasks,
          InReview: inReviewTasks,
          OnHold: onHoldTasks,
          Completed: completedTasks,
          All: totalTasks,
        },
        taskPriorityLevels,
      },
      recentTasks,
      recentTasksPagination: {
    currentPage: pageNumber,
    totalPages: Math.ceil(totalRecentTasks / pageSize),
    totalItems: totalRecentTasks,
    pageSize,
  },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
 USER DASHBOARD DATA (MEMBER)
================================ */
const getUserDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    const baseFilter = {
      assignedTo: { $in: [userId] },
    };

    const totalTasks = await Task.countDocuments(baseFilter);
    const pendingTasks = await Task.countDocuments({
      ...baseFilter,
      status: "Pending",
    });
    const inProgressTasks = await Task.countDocuments({
      ...baseFilter,
      status: "In Progress",
    });
    const completedTasks = await Task.countDocuments({
      ...baseFilter,
      status: "Completed",
    });
    const overdueTasks = await Task.countDocuments({
      ...baseFilter,
      status: { $ne: "Completed" },
      dueDate: { $lt: new Date() },
    });

    const priorityAgg = await Task.aggregate([
      { $match: baseFilter },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    const taskPriorityLevels = {
      Low: priorityAgg.find((p) => p._id === "Low")?.count || 0,
      Medium: priorityAgg.find((p) => p._id === "Medium")?.count || 0,
      High: priorityAgg.find((p) => p._id === "High")?.count || 0,
    };

    const recentTasks = await Task.find(baseFilter)
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status priority dueDate createdAt createdBy")
      .populate("createdBy", "name email");

    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
      },
      charts: {
        taskDistribution: {
          Pending: pendingTasks,
          InProgress: inProgressTasks,
          Completed: completedTasks,
          All: totalTasks,
        },
        taskPriorityLevels,
      },
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
 USER ANALYTICS (ADMIN)
================================ */
const getUserAnalyticsByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const baseFilter = {
      assignedTo: { $in: [userId] },
    };

    const [
      totalTasks,
      pendingTasks,
      inProgressTasks,
      inReviewTasks,
      completedTasks,
      OnHoldTasks,
      overdueTasks,
    ] = await Promise.all([
      Task.countDocuments(baseFilter),
      Task.countDocuments({ ...baseFilter, status: "Pending" }),
      Task.countDocuments({ ...baseFilter, status: "In Progress" }),
      Task.countDocuments({ ...baseFilter, status: "In Review" }),
      Task.countDocuments({ ...baseFilter, status: "Completed" }),
      Task.countDocuments({ ...baseFilter, status: "OnHold" }),
      Task.countDocuments({
        ...baseFilter,
        status: { $ne: "Completed" },
        dueDate: { $lt: new Date() },
      }),
    ]);

    const priorityAgg = await Task.aggregate([
      { $match: baseFilter },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    const taskPriorityLevels = {
      Low: priorityAgg.find((p) => p._id === "Low")?.count || 0,
      Medium: priorityAgg.find((p) => p._id === "Medium")?.count || 0,
      High: priorityAgg.find((p) => p._id === "High")?.count || 0,
    };

    const recentTasks = await Task.find(baseFilter)
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status priority dueDate createdAt createdBy")
      .populate("createdBy", "name email");

    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        inProgressTasks,
        inReviewTasks,
        completedTasks,
        onHoldTasks,
        overdueTasks,
      },
      charts: {
        taskDistribution: {
          Pending: pendingTasks,
          InProgress: inProgressTasks,
          InReview: inReviewTasks,
          Completed: completedTasks,
          OnHold: onHoldTasks,
          All: totalTasks,
        },
        taskPriorityLevels,
      },
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
  getDashboardData,
  getUserDashboardData,
  addComment,
  getUserAnalyticsByAdmin,
};

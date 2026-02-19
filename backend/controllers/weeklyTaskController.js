const WeeklyTask = require("../models/WeeklyTask");
const {getCurrentWeekRange} = require("../utils/date")
/* ===============================
   CREATE WEEKLY TASK
================================ */
const createWeeklyTask = async (req, res) => {
  try {
    const { name, description, subtasks = [] } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const { weekStart, weekEnd } = getCurrentWeekRange();

    // 🔥 CHECK IF USER ALREADY SUBMITTED THIS WEEK
    const existing = await WeeklyTask.findOne({
      createdBy: req.user._id,
      weekStart,
      weekEnd,
    });

    if (existing) {
      return res.status(400).json({
        message: "You have already submitted a weekly task for this week",
      });
    }

    const weeklyTask = await WeeklyTask.create({
      name,
      description,
      subtasks,
      createdBy: req.user._id,
      weekStart,
      weekEnd,
      status: "Submitted",
    });

    res.status(201).json({
      message: "Weekly task submitted successfully",
      weeklyTask,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateWeeklyTaskStatus = async (req, res) => {
  try {
    /* ===============================
       ROLE CHECK
    =============================== */
    if (
      req.user.role !== "admin" &&
      req.user.role !== "superadmin"
    ) {
      return res
        .status(403)
        .json({ message: "You are not authorized" });
    }

    const { status } = req.body;

    /* ===============================
       VALIDATE STATUS
    =============================== */
    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const task = await WeeklyTask.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Weekly task not found",
      });
    }

    /* ===============================
       PREVENT DOUBLE ACTION
    =============================== */
    if (task.status !== "Submitted") {
      return res.status(400).json({
        message: "Task already reviewed",
      });
    }

    /* ===============================
       UPDATE STATUS
    =============================== */
    task.status = status;
    task.reviewedBy = req.user._id;     // optional field
    task.reviewedAt = new Date();       // optional field

    await task.save();

    res.status(200).json({
      message: `Weekly task ${status}`,
      task,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Status update failed",
    });
  }
};

// const updateWeeklyTask = async (req, res) => {
//   try {
//     const task = await WeeklyTask.findById(req.params.id);

//     if (!task)
//       return res.status(404).json({ message: "Weekly task not found" });

//     if (task.createdBy.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     if (task.status === "Approved") {
//       return res.status(400).json({
//         message: "Approved weekly task cannot be edited",
//       });
//     }

//     Object.assign(task, req.body);

//     await task.save();

//     res.json({
//       message: "Weekly task updated successfully",
//       weeklyTask: task,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const updateWeeklyTask = async (req, res) => {
  try {
    const task = await WeeklyTask.findById(req.params.id);

    if (!task)
      return res.status(404).json({ message: "Weekly task not found" });

    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (task.status === "Approved") {
      return res.status(400).json({
        message: "Approved weekly task cannot be edited",
      });
    }

    // Apply updates
    Object.assign(task, req.body);

    // 🔥 If previously rejected → resubmit automatically
    if (task.status === "Rejected") {
      task.status = "Submitted";
    }

    await task.save();

    res.json({
      message: "Weekly task updated successfully",
      weeklyTask: task,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getMyCurrentWeeklyTask = async (req, res) => {
  try {
    const { weekStart, weekEnd } = getCurrentWeekRange();

    const task = await WeeklyTask.findOne({
      createdBy: req.user._id,
      createdAt: {
        $gte: weekStart,
        $lte: weekEnd,
      },
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getWeeklyTaskById = async (req, res) => {
  try {
    const task = await WeeklyTask.findById(req.params.id)
      .populate("createdBy", "name email profileImageUrl");

    if (!task)
      return res.status(404).json({ message: "Not found" });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getMyWeeklyHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const total = await WeeklyTask.countDocuments({
      createdBy: req.user._id,
    });

    const tasks = await WeeklyTask.find({
      createdBy: req.user._id,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      tasks,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getWeeklyTasksByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const weeklyTasks = await WeeklyTask.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");

    res.status(200).json({
      weeklyTasks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};




module.exports = {updateWeeklyTaskStatus, getWeeklyTasksByUser, createWeeklyTask, updateWeeklyTask, getMyCurrentWeeklyTask, getWeeklyTaskById, getMyWeeklyHistory}
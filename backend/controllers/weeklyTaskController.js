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

    Object.assign(task, req.body);

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




module.exports = {createWeeklyTask, updateWeeklyTask, getMyCurrentWeeklyTask, getWeeklyTaskById, getMyWeeklyHistory}
const Task = require("../models/Task");

// ===============================
// GET ALL TASKS
// ===============================
const getTasks = async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};

        if (status) filter.status = status;

        // 🔐 role-based scope
        if (req.user.role === "admin") {
            filter.createdBy = req.user._id;
        } else if (req.user.role === "member") {
            filter.assignedTo = req.user._id;
        }
        // superadmin → no filter

        let tasks = await Task.find(filter).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        tasks = tasks.map((task) => {
            const completedCount = task.todoCheckList.filter(
                (item) => item.completed
            ).length;

            return { ...task._doc, completedTodoCount: completedCount };
        });

        // ===== status summary (unchanged response) =====
        const baseFilter =
            req.user.role === "superadmin"
                ? {}
                : req.user.role === "admin"
                ? { createdBy: req.user._id }
                : { assignedTo: req.user._id };

        const allTasks = await Task.countDocuments(baseFilter);

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

        res.json({
            tasks,
            statusSummary: {
                all: allTasks,
                pendingTasks,
                inProgressTasks,
                completedTasks,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

// ===============================
// GET TASK BY ID
// ===============================
const getTaskById = async (req, res) => {
    try {
        const filter = { _id: req.params.id };

        if (req.user.role === "admin") {
            filter.createdBy = req.user._id;
        } else if (req.user.role === "member") {
            filter.assignedTo = req.user._id;
        }

        const task = await Task.findOne(filter).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        if (!task)
            return res.status(404).json({ message: "Task not found" });

        res.json(task);
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

// ===============================
// CREATE TASK
// ===============================
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            attachments,
            todoCheckList,
        } = req.body;

        if (!Array.isArray(assignedTo)) {
            return res
                .status(400)
                .json({ message: "assignedTo must be an array of user IDs" });
        }

        const task = await Task.create({
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            createdBy: req.user._id,
            todoCheckList,
            attachments,
        });

        res.status(201).json({
            message: "Task created successfully",
            task,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

// ===============================
// UPDATE TASK
// ===============================
const updateTask = async (req, res) => {
    try {
        const filter = { _id: req.params.id };

        if (req.user.role === "admin") {
            filter.createdBy = req.user._id;
        } else if (req.user.role === "member") {
            filter.assignedTo = req.user._id;
        }

        const task = await Task.findOne(filter);

        if (!task)
            return res.status(404).json({ message: "Task not found" });

        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.priority = req.body.priority || task.priority;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.todoCheckList = req.body.todoCheckList || task.todoCheckList;
        task.attachments = req.body.attachments || task.attachments;

        if (req.body.assignedTo) {
            if (!Array.isArray(req.body.assignedTo)) {
                return res
                    .status(400)
                    .json({ message: "assignedTo must be an array" });
            }
            task.assignedTo = req.body.assignedTo;
        }

        const updatedTask = await task.save();
        res.json({ message: "Task updated successfully", updatedTask });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

// ===============================
// DELETE TASK
// ===============================
const deleteTask = async (req, res) => {
    try {
        const filter = { _id: req.params.id };

        if (req.user.role === "admin") {
            filter.createdBy = req.user._id;
        }

        const task = await Task.findOne(filter);

        if (!task)
            return res.status(404).json({ message: "Task not found" });

        await task.deleteOne();
        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

// ===============================
// UPDATE TASK STATUS
// ===============================
const updateTaskStatus = async (req, res) => {
    try {
        const filter = { _id: req.params.id };

        if (req.user.role === "admin") {
            filter.createdBy = req.user._id;
        } else if (req.user.role === "member") {
            filter.assignedTo = req.user._id;
        }

        const task = await Task.findOne(filter);

        if (!task)
            return res.status(404).json({ message: "Task not found" });

        task.status = req.body.status || task.status;

        if (task.status === "Completed") {
            task.todoCheckList.forEach((item) => (item.completed = true));
            task.progress = 100;
        }

        await task.save();

        res.json({ message: "Task status updated", task });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

// ===============================
// UPDATE TASK CHECKLIST
// ===============================
const updateTaskChecklist = async (req, res) => {
    try {
        const filter = { _id: req.params.id };

        if (req.user.role === "admin") {
            filter.createdBy = req.user._id;
        } else if (req.user.role === "member") {
            filter.assignedTo = req.user._id;
        }

        const task = await Task.findOne(filter);

        if (!task)
            return res.status(404).json({ message: "Task not found" });

        task.todoCheckList = req.body.todoCheckList;

        const completedCount = task.todoCheckList.filter(
            (item) => item.completed
        ).length;

        const totalItems = task.todoCheckList.length;

        task.progress =
            totalItems > 0
                ? Math.round((completedCount / totalItems) * 100)
                : 0;

        if (task.progress === 100) task.status = "Completed";
        else if (task.progress > 0) task.status = "In Progress";
        else task.status = "Pending";

        await task.save();

        const updatedTask = await Task.findById(req.params.id).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        res.json({
            message: "Task checklist updated",
            task: updatedTask,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

// ===============================
// DASHBOARD DATA (UNCHANGED SHAPE)
// ===============================
const getDashboardData = async (req, res) => {
    try {
        const baseFilter =
            req.user.role === "superadmin"
                ? {}
                : { createdBy: req.user._id };

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

        const taskDistribution = {
            Pending: pendingTasks,
            InProgress: inProgressTasks,
            Completed: completedTasks,
            All: totalTasks,
        };

        const priorityAgg = await Task.aggregate([
            { $match: baseFilter },
            { $group: { _id: "$priority", count: { $sum: 1 } } },
        ]);

        const taskPriorityLevels = {
            Low: priorityAgg.find(p => p._id === "Low")?.count || 0,
            Medium: priorityAgg.find(p => p._id === "Medium")?.count || 0,
            High: priorityAgg.find(p => p._id === "High")?.count || 0,
        };

        const recentTasks = await Task.find(baseFilter)
            .sort({ createdAt: -1 })
            .limit(10)
            .select("title status priority dueDate createdAt");

        res.status(200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                inProgressTasks,
                completedTasks,
                overdueTasks,
            },
            charts: {
                taskDistribution,
                taskPriorityLevels,
            },
            recentTasks,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

// ===============================
// USER DASHBOARD DATA (UNCHANGED)
// ===============================
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

        const taskDistribution = {
            Pending: pendingTasks,
            InProgress: inProgressTasks,
            Completed: completedTasks,
            All: totalTasks,
        };

        const priorityAgg = await Task.aggregate([
            { $match: baseFilter },
            { $group: { _id: "$priority", count: { $sum: 1 } } },
        ]);

        const taskPriorityLevels = {
            Low: priorityAgg.find(p => p._id === "Low")?.count || 0,
            Medium: priorityAgg.find(p => p._id === "Medium")?.count || 0,
            High: priorityAgg.find(p => p._id === "High")?.count || 0,
        };

        const recentTasks = await Task.find(baseFilter)
            .sort({ createdAt: -1 })
            .limit(10)
            .select("title status priority dueDate createdAt");

        res.status(200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                inProgressTasks,
                completedTasks,
                overdueTasks,
            },
            charts: {
                taskDistribution,
                taskPriorityLevels,
            },
            recentTasks,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
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
};

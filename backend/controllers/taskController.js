const Task = require("../models/Task");
const addLog = require("../utils/addLogs");
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");

const getDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

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
      createdBy,
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
      const [sy, sm, sd] = startDate.split("-");
      const [ey, em, ed] = endDate.split("-");

      const start = new Date(sy, sm - 1, sd, 0, 0, 0, 0);
      const end = new Date(ey, em - 1, ed, 23, 59, 59, 999);

      filter.dueDate = {
        $gte: start,
        $lte: end,
      };
    }

    if (!startDate && endDate) {
      filter.dueDate = { $gte: new Date(endDate), $lte: new Date(endDate) };
    }

    // ✅ Role-based access
    if (req.user.role === "admin") {
      filter.createdBy = req.user._id;
    } else if (req.user.role === "member") {
      filter.assignedTo = req.user._id;
    }

    // ✅ Superadmin createdBy filter
    if (req.user.role === "superadmin" && createdBy) {
      if (createdBy === "me") {
        filter.createdBy = req.user._id;
      } else {
        filter.createdBy = createdBy;
      }
    }

    // ✅ Pagination math
    const pageNumber = Number(page);
    const pageSize = Number(limit);
    const skip = (pageNumber - 1) * pageSize;

    // ✅ Fetch paginated tasks + total count
    const [tasks, totalTasks] = await Promise.all([
      Task.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip) // 🔥 pagination
        .limit(pageSize) // 🔥 pagination
        .populate("assignedTo", "name email profileImageUrl")
        .populate("project", "name")
        .populate("createdBy", "name email"),

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
      .populate("todoCheckList.assignedTo", "name email profileImageUrl")
      .populate("createdBy", "name email profileImageUrl");

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
// const createTask = async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       priority,
//       dueDate,
//       estimatedHours, // ✅ NEW REQUIRED FIELD
//       assignedTo,
//       project,
//       attachments = [],
//       todoCheckList = [],
//     } = req.body;

//     // ✅ Validation
//     if (!title || !dueDate || !assignedTo?.length) {
//       return res.status(400).json({ message: "Invalid task data" });
//     }

//     if (!estimatedHours || estimatedHours < 1) {
//       return res
//         .status(400)
//         .json({ message: "Estimated hours is required (min 1 hour)" });
//     }

//     // ✅ Normalize Subtasks
//     const normalizedTodos = todoCheckList.map((t) => ({
//       text: t.text || t,
//       completed: t.completed ?? false,
//       assignedTo: t.assignedTo || null, // ✅ One assignee per subtask
//     }));

//     // ✅ Create Task
//     const task = await Task.create({
//       title,
//       description,
//       priority,
//       dueDate,
//       estimatedHours, // ✅ Save Hours
//       assignedTo,
//       project: project || null,
//       createdBy: req.user._id,
//       todoCheckList: normalizedTodos,
//       attachments,
//       logs: [
//         {
//           action: "TASK_CREATED",
//           description: "Task created",
//           performedBy: req.user._id,
//         },
//       ],
//     });

//     res.status(201).json({ message: "Task created", task });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      estimatedHours,
      assignedTo,
      project,
      attachments = [],
      todoCheckList = [],
    } = req.body;

    /* ---------------- BASIC VALIDATION ---------------- */
    if (!title || !dueDate || !assignedTo?.length) {
      return res.status(400).json({ message: "Invalid task data" });
    }

    if (!estimatedHours || estimatedHours < 1) {
      return res
        .status(400)
        .json({ message: "Estimated hours is required (min 1 hour)" });
    }

    /* ---------------- SUBTASK VALIDATION ---------------- */
    const invalidSubtask = todoCheckList.find(
      (t) => !t.assignedTo || !String(t.assignedTo).trim(),
    );

    if (invalidSubtask) {
      return res.status(400).json({
        message: "Each subtask must have exactly one assignee",
      });
    }

    /* ---------------- NORMALIZE SUBTASKS ---------------- */
    const normalizedTodos = todoCheckList.map((t) => ({
      text: t.text || t,
      completed: t.completed ?? false,
      assignedTo: t.assignedTo, // ✅ guaranteed to exist
    }));

    const parsedDueDate = new Date(dueDate);
    parsedDueDate.setHours(23, 59, 59, 999);

    /* ---------------- CREATE TASK ---------------- */
    const task = await Task.create({
      title,
      description,
      priority,
      dueDate: parsedDueDate,
      estimatedHours,
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
// const updateTask = async (req, res) => {
//   try {
//     const filter = { _id: req.params.id };

//     if (req.body.estimatedHours && req.body.estimatedHours < 1) {
//       return res.status(400).json({
//         message: "Estimated hours must be at least 1",
//       });
//     }

//     if (req.body.dueDate) {
//       const parsedDueDate = new Date(req.body.dueDate);
//       parsedDueDate.setHours(23, 59, 59, 999);
//       req.body.dueDate = parsedDueDate;
//     }

//     if (req.user.role === "admin") filter.createdBy = req.user._id;
//     else if (req.user.role === "member") filter.assignedTo = req.user._id;

//     const task = await Task.findOne(filter);
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     if (req.body.project === "") {
//       req.body.project = null;
//     }

//     Object.assign(task, req.body);

//     addLog(task, "TASK_UPDATED", "Task updated", req.user._id);

//     await task.save();
//     res.json({ message: "Task updated", task });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


const updateTask = async (req, res) => {
  try {
    console.log("UPDATE Task body: ", req.body);

    /* ===============================
       FIND TASK BASED ON ROLE
    =============================== */

    const filter = { _id: req.params.id };

    if (req.user.role === "admin") {
      filter.createdBy = req.user._id;
    } else if (req.user.role === "member") {
      filter.assignedTo = req.user._id;
    }

    const task = await Task.findOne(filter);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    /* ===============================
       VALIDATION
    =============================== */

    if (req.body.estimatedHours && req.body.estimatedHours < 1) {
      return res.status(400).json({
        message: "Estimated hours must be at least 1",
      });
    }

    if (req.body.dueDate) {
      const parsedDueDate = new Date(req.body.dueDate);
      parsedDueDate.setHours(23, 59, 59, 999);
      req.body.dueDate = parsedDueDate;
    }

    if (req.body.project === "") {
      req.body.project = null;
    }

    /* ===============================
       🔥 MEMBER REMOVAL LOGIC
    =============================== */

    let removedMembers = [];

    if (req.body.assignedTo) {
      const oldMembers = task.assignedTo.map((id) => id.toString());
      const newMembers = req.body.assignedTo.map((id) => id.toString());

      console.log("old members:", oldMembers);
      console.log("new members:", newMembers);

      removedMembers = oldMembers.filter(
        (memberId) => !newMembers.includes(memberId)
      );
    }

    /* ===============================
       UPDATE BASIC FIELDS (SAFE)
    =============================== */

    const {
      title,
      description,
      priority,
      estimatedHours,
      dueDate,
      assignedTo,
      project,
      attachments,
      todoCheckList,
    } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (project !== undefined) task.project = project;
    if (attachments !== undefined) task.attachments = attachments;

    /* ===============================
       HANDLE CHECKLIST SAFELY
    =============================== */

    if (todoCheckList !== undefined) {
      let updatedChecklist = todoCheckList;

      // Remove subtasks assigned to removed members
      if (removedMembers.length > 0) {
        updatedChecklist = updatedChecklist.filter((subtask) => {
          if (!subtask.assignedTo) return true;

          return !removedMembers.includes(
            subtask.assignedTo.toString()
          );
        });
      }

      task.todoCheckList = updatedChecklist;
    } else {
      // If checklist not sent, still clean existing subtasks if members removed
      if (removedMembers.length > 0) {
        task.todoCheckList = task.todoCheckList.filter((subtask) => {
          if (!subtask.assignedTo) return true;

          return !removedMembers.includes(
            subtask.assignedTo.toString()
          );
        });
      }
    }

    /* ===============================
       ADD LOG
    =============================== */

    addLog(task, "TASK_UPDATED", "Task updated", req.user._id);

    await task.save();

    res.json({
      message: "Task updated",
      task,
    });
  } catch (error) {
    console.error("Update task error:", error);
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
// const updateTaskChecklist = async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.id);
//     console.log(task);
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     task.todoCheckList = req.body.todoCheckList.map((t) => ({
//       text: t.text,
//       completed: t.completed ?? false,
//       assignedTo: t.assignedTo,
//     }));

//     const completed = task.todoCheckList.filter((t) => t.completed).length;
//     const total = task.todoCheckList.length;

//     task.progress = total ? Math.round((completed / total) * 100) : 0;

//     if (task.progress === 100) {
//       task.status = "In Review";
//       addLog(task, "TASK_IN_REVIEW", "Moved to In Review", req.user._id);
//     } else if (task.progress > 0) {
//       task.status = "In Progress";
//     } else {
//       task.status = "Pending";
//     }

//     await task.save();
//     res.json({ message: "Checklist updated", task });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//     console.log(error);
//   }
// };

const updateTaskChecklist = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const incomingChecklist = req.body.todoCheckList;

    task.todoCheckList = task.todoCheckList.map((existing) => {
      const incoming = incomingChecklist.find(
        (t) => t._id.toString() === existing._id.toString(),
      );

      if (!incoming) return existing;

      // Only assigned user can modify
      if (existing.assignedTo.toString() === req.user._id.toString()) {
        existing.completed = incoming.completed;
        existing.completedAt = incoming.completed ? new Date() : null;
      }

      return existing;
    });

    // Recalculate progress only
    const completedCount = task.todoCheckList.filter((t) => t.completed).length;

    const total = task.todoCheckList.length;

    task.progress = total ? Math.round((completedCount / total) * 100) : 0;

    // DO NOT TOUCH STATUS HERE

    await task.save();

    res.status(200).json({
      message: "Checklist updated",
      task,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const updateSubtask = async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;
    const completed = req.body.completed === "true";

    if (!req.file && req.body.completed === undefined) {
      return res.status(400).json({
        message: "Nothing to update",
      });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const subtask = task.todoCheckList.id(subtaskId);
    if (!subtask) return res.status(404).json({ message: "Subtask not found" });

    if (subtask.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    /* ===============================
       UPDATE COMPLETION
    =============================== */

    subtask.completed = completed;
    subtask.completedAt = completed ? new Date() : null;

    /* ===============================
       DELETE FILE IF UNCHECKED
    =============================== */

    if (!completed && subtask.document?.public_id) {
      await cloudinary.uploader.destroy(subtask.document.public_id);
      subtask.document = undefined;
    }

    /* ===============================
       UPLOAD NEW FILE (BUFFER ONLY)
    =============================== */
    console.log(req.file);
    if (req.file) {
      // Delete old file
      if (subtask.document?.public_id) {
        const res = await cloudinary.uploader.destroy(
          subtask.document.public_id,
        );
        console.log(res);
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "task-attachments" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        stream.end(req.file.buffer);
      });

      console.log(result);

      subtask.set("document", {
        fileName: req.file.originalname,
        fileUrl: result.secure_url,
        public_id: result.public_id,
        uploadedBy: req.user._id,
        uploadedAt: new Date(),
      });
    }

    /* ===============================
       AUTO STATUS LOGIC
    =============================== */

    const total = task.todoCheckList.length;
    const completedCount = task.todoCheckList.filter((t) => t.completed).length;

    task.progress = total ? Math.round((completedCount / total) * 100) : 0;

    if (completedCount === 0) {
      task.status = "Pending";
    } else if (completedCount === total) {
      // 🔥 Move to In Review, NOT Completed
      if (task.status !== "In Review") {
        task.status = "In Review";

        addLog(
          task,
          "TASK_IN_REVIEW",
          "All subtasks completed. Task moved to In Review.",
          req.user._id,
        );
      }
    } else {
      task.status = "In Progress";
    }

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email profileImageUrl")
      .populate("todoCheckList.assignedTo", "name profileImageUrl")
      .populate("comments.commentedBy", "name profileImageUrl");

    res.json({
      message: "Subtask updated successfully",
      task: populatedTask,
    });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({
      message: "Update failed",
    });
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
    } else if(req.user.role === "member") {
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

/* ======================================
   UPLOAD FILE FOR A SPECIFIC SUBTASK
====================================== */
const uploadSubtaskFile = async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: "No file provided",
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const subtask = task.todoCheckList.id(subtaskId);
    if (!subtask) {
      return res.status(404).json({
        message: "Subtask not found",
      });
    }

    // ✅ SECURITY: Only assigned user can upload
    if (subtask.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to upload file for this subtask",
      });
    }

    // Upload to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "subtask-documents" },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({
            message: "Cloudinary upload failed",
          });
        }

        // Save file inside subtask
        subtask.document = {
          fileName: req.file.originalname,
          fileUrl: result.secure_url,
          uploadedBy: req.user._id,
          uploadedAt: new Date(),
        };

        await task.save();

        // Optional: add log
        task.logs.push({
          action: "SUBTASK_FILE_UPLOADED",
          description: `File uploaded for subtask "${subtask.text}"`,
          performedBy: req.user._id,
        });

        await task.save();

        res.status(200).json({
          message: "File uploaded successfully",
          task,
        });
      },
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error("Subtask upload error:", error);
    res.status(500).json({
      message: "Upload failed",
    });
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

// const getDashboardData = async (req, res) => {
//   try {
//     const { projectId, startDate, endDate, recentStatus, recentPriority,  page = 1,
//   limit = 10 } = req.query;

//   const pageNumber = Number(page);
// const pageSize = Number(limit);
// const skip = (pageNumber - 1) * pageSize;

//     const baseFilter =
//       req.user.role === "superadmin" ? {} : { createdBy: req.user._id };

//     // if (projectId === "null") {
//     //   baseFilter.project = null; // loose tasks
//     // } else if (projectId) {
//     //   baseFilter.project = projectId;
//     // }

//     if (projectId === "null") {
//   baseFilter.project = null;
// } else if (projectId) {
//   baseFilter.project = new mongoose.Types.ObjectId(projectId);
// }

//     // ✅ Date range filter on dueDate
//     if (startDate && endDate) {
//       baseFilter.dueDate = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate),
//       };
//     }

//     const totalTasks = await Task.countDocuments(baseFilter);

//     const pendingTasks = await Task.countDocuments({
//       ...baseFilter,
//       status: "Pending",
//     });

//     const inProgressTasks = await Task.countDocuments({
//       ...baseFilter,
//       status: "In Progress",
//     });

//     const completedTasks = await Task.countDocuments({
//       ...baseFilter,
//       status: "Completed",
//     });

//     const overdueTasks = await Task.countDocuments({
//       ...baseFilter,
//       status: { $ne: "Completed" },
//       dueDate: { $lt: new Date() },
//     });

//     const inReviewTasks = await Task.countDocuments({
//       ...baseFilter,
//       status: "In Review",
//     });

//     const onHoldTasks = await Task.countDocuments({
//       ...baseFilter,
//       status: "OnHold",
//     });

//     const priorityAgg = await Task.aggregate([
//       { $match: baseFilter },
//       {
//         $group: {
//           _id: "$priority",
//           count: { $sum: 1 },
//         },
//       },
//     ]);

//     const taskPriorityLevels = {
//       Low: priorityAgg.find((p) => p._id == "Low")?.count || 0,
//       Medium: priorityAgg.find((p) => p._id == "Medium")?.count || 0,
//       High: priorityAgg.find((p) => p._id == "High")?.count || 0,
//     };

//     const recentTasksFilter = { ...baseFilter };

//     if (recentStatus) {
//       recentTasksFilter.status = recentStatus;
//     }

//     if (recentPriority) {
//       recentTasksFilter.priority = recentPriority;
//     }

//    const [recentTasks, totalRecentTasks] = await Promise.all([
//   Task.find(recentTasksFilter)
//     .sort({ createdAt: -1 })
//     .skip(skip)
//     .limit(pageSize)
//     .select("title status priority dueDate createdAt project assignedTo")
//     .populate("project", "name")
//     .populate("assignedTo", "name email profileImageUrl"),

//   Task.countDocuments(recentTasksFilter),
// ]);

//     res.status(200).json({
//       statistics: {
//         totalTasks,
//         pendingTasks,
//         inProgressTasks,
//         completedTasks,
//         overdueTasks,
//         inReviewTasks,
//         onHoldTasks,
//       },
//       charts: {
//         taskDistribution: {
//           Pending: pendingTasks,
//           InProgress: inProgressTasks,
//           InReview: inReviewTasks,
//           OnHold: onHoldTasks,
//           Completed: completedTasks,
//           All: totalTasks,
//         },
//         taskPriorityLevels,
//       },
//       recentTasks,
//       recentTasksPagination: {
//     currentPage: pageNumber,
//     totalPages: Math.ceil(totalRecentTasks / pageSize),
//     totalItems: totalRecentTasks,
//     pageSize,
//   },
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const getDashboardData = async (req, res) => {
  try {
    const {
      projectId,
      startDate,
      endDate,
      recentStatus,
      recentPriority,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Number(page);
    const pageSize = Number(limit);
    const skip = (pageNumber - 1) * pageSize;

    let baseFilter = {};

    if (req.user.role !== "superadmin") {
      baseFilter.createdBy = req.user._id;
    }

    /* ---------- PROJECT FILTER ---------- */
    if (projectId === "null") {
      baseFilter.$or = [{ project: null }, { project: { $exists: false } }];
    } else if (projectId) {
      baseFilter.project = new mongoose.Types.ObjectId(projectId);
    }

    /* ---------- DATE FILTER ---------- */
    // if (startDate && endDate) {
    //   baseFilter.dueDate = {
    //     $gte: new Date(startDate),
    //     $lte: new Date(endDate),
    //   };
    // }

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      baseFilter.dueDate = {
        $gte: start,
        $lte: end,
      };
    }

    /* ---------- STATUS COUNTS ---------- */
    const [
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      inReviewTasks,
      onHoldTasks,
    ] = await Promise.all([
      Task.countDocuments(baseFilter),
      Task.countDocuments({ ...baseFilter, status: "Pending" }),
      Task.countDocuments({ ...baseFilter, status: "In Progress" }),
      Task.countDocuments({ ...baseFilter, status: "Completed" }),
      Task.countDocuments({ ...baseFilter, status: "In Review" }),
      Task.countDocuments({ ...baseFilter, status: "OnHold" }),
    ]);

    /* ---------- PRIORITY AGG ---------- */
    const priorityAgg = await Task.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    const taskPriorityLevels = { Low: 0, Medium: 0, High: 0 };

    priorityAgg.forEach((p) => {
      if (taskPriorityLevels[p._id] !== undefined) {
        taskPriorityLevels[p._id] = p.count;
      }
    });

    /* ---------- RECENT TASKS ---------- */
    let recentTasksFilter = { ...baseFilter };

    if (recentStatus) recentTasksFilter.status = recentStatus;
    if (recentPriority) recentTasksFilter.priority = recentPriority;

    const [recentTasks, totalRecentTasks] = await Promise.all([
      Task.find(recentTasksFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate("project", "name")
        .populate("assignedTo", "name email profileImageUrl")
        .populate("createdBy", "name profileImageUrl"),

      Task.countDocuments(recentTasksFilter),
    ]);

    res.status(200).json({
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
    console.error("Dashboard error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
 USER DASHBOARD DATA (MEMBER)
================================ */
// const getUserDashboardData = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const baseFilter = {
//       assignedTo: { $in: [userId] },
//     };

//     const totalTasks = await Task.countDocuments(baseFilter);
//     const pendingTasks = await Task.countDocuments({
//       ...baseFilter,
//       status: "Pending",
//     });
//     const inProgressTasks = await Task.countDocuments({
//       ...baseFilter,
//       status: "In Progress",
//     });
//     const completedTasks = await Task.countDocuments({
//       ...baseFilter,
//       status: "Completed",
//     });
//     const overdueTasks = await Task.countDocuments({
//       ...baseFilter,
//       status: { $ne: "Completed" },
//       dueDate: { $lt: new Date() },
//     });

//     const priorityAgg = await Task.aggregate([
//       { $match: baseFilter },
//       { $group: { _id: "$priority", count: { $sum: 1 } } },
//     ]);

//     const taskPriorityLevels = {
//       Low: priorityAgg.find((p) => p._id === "Low")?.count || 0,
//       Medium: priorityAgg.find((p) => p._id === "Medium")?.count || 0,
//       High: priorityAgg.find((p) => p._id === "High")?.count || 0,
//     };

//     const recentTasks = await Task.find(baseFilter)
//       .sort({ createdAt: -1 })
//       .limit(10)
//       .select("title status priority dueDate createdAt createdBy")
//       .populate("createdBy", "name email");

//     res.status(200).json({
//       statistics: {
//         totalTasks,
//         pendingTasks,
//         inProgressTasks,
//         completedTasks,
//         overdueTasks,
//       },
//       charts: {
//         taskDistribution: {
//           Pending: pendingTasks,
//           InProgress: inProgressTasks,
//           Completed: completedTasks,
//           All: totalTasks,
//         },
//         taskPriorityLevels,
//       },
//       recentTasks,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const getUserDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      projectId,
      dueStartDate,
      dueEndDate,
      createdStartDate,
      createdEndDate,
      recentStatus,
      recentPriority,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Number(page);
    const pageSize = Number(limit);
    const skip = (pageNumber - 1) * pageSize;

    /* ================= BASE FILTER ================= */
    let baseFilter = {
      assignedTo: { $in: [userId] },
    };

    /* ================= PROJECT FILTER ================= */
    if (projectId === "null") {
      baseFilter.$or = [{ project: null }, { project: { $exists: false } }];
    } else if (projectId) {
      baseFilter.project = new mongoose.Types.ObjectId(projectId);
    }

    /* ================= DUE DATE FILTER ================= */
    // if (dueStartDate && dueEndDate) {
    //   baseFilter.dueDate = {
    //     $gte: new Date(dueStartDate),
    //     $lte: new Date(dueEndDate),
    //   };
    // }

    if (dueStartDate && dueEndDate) {
      const start = new Date(dueStartDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(dueEndDate);
      end.setHours(23, 59, 59, 999);

      baseFilter.dueDate = {
        $gte: start,
        $lte: end,
      };
    }

    /* ================= CREATED DATE FILTER ================= */
    if (createdStartDate && createdEndDate) {
      baseFilter.createdAt = {
        $gte: new Date(createdStartDate),
        $lte: new Date(createdEndDate),
      };
    }

    /* ================= STATUS COUNTS ================= */
    const [
      totalTasks,
      pendingTasks,
      inProgressTasks,
      inReviewTasks,
      completedTasks,
      overdueTasks,
    ] = await Promise.all([
      Task.countDocuments(baseFilter),
      Task.countDocuments({ ...baseFilter, status: "Pending" }),
      Task.countDocuments({ ...baseFilter, status: "In Progress" }),
      Task.countDocuments({ ...baseFilter, status: "In Review" }),
      Task.countDocuments({ ...baseFilter, status: "Completed" }),
      Task.countDocuments({
        ...baseFilter,
        status: { $ne: "Completed" },
        dueDate: { $lt: new Date() },
      }),
    ]);

    /* ================= PRIORITY AGG ================= */
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
      Low: 0,
      Medium: 0,
      High: 0,
    };

    priorityAgg.forEach((p) => {
      if (taskPriorityLevels[p._id] !== undefined) {
        taskPriorityLevels[p._id] = p.count;
      }
    });

    /* ================= RECENT TASKS FILTER ================= */
    let recentTasksFilter = { ...baseFilter };

    if (recentStatus) recentTasksFilter.status = recentStatus;
    if (recentPriority) recentTasksFilter.priority = recentPriority;

    const [recentTasks, totalRecentTasks] = await Promise.all([
      Task.find(recentTasksFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .select("title status priority dueDate createdAt project")
        .populate("project", "name")
        .populate("createdBy", "name email"),

      Task.countDocuments(recentTasksFilter),
    ]);

    /* ================= RESPONSE ================= */
    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        inProgressTasks,
        inReviewTasks,
        completedTasks,
        overdueTasks,
      },
      charts: {
        taskDistribution: {
          Pending: pendingTasks,
          InProgress: inProgressTasks,
          InReview: inReviewTasks,
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
    console.error("User dashboard error:", error);
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
  uploadSubtaskFile,
  updateSubtask,
};

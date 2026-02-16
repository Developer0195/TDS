const express = require("express");
const { protect, adminOnly, superadminOnly } = require("../middlewares/authMiddleware");
const { getDashboardData, getUserDashboardData, getTasks, getTaskById, updateSubtask, createTask, updateTask, deleteTask, updateTaskStatus, updateTaskChecklist, addComment, getUserAnalyticsByAdmin, uploadSubtaskFile } = require("../controllers/taskController");
const { generateTaskUsingAI,estimateTaskUsingAI } = require("../controllers/taskAIController");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Task Management Routes
router.get("/dashboard-data", protect, adminOnly, getDashboardData);
router.get("/user-dashboard-data", protect, getUserDashboardData);
router.get("/", protect, getTasks); // Get all tasks (Admin: all, User: assigned)
router.get("/:id", protect, getTaskById); // Get task by ID
router.post("/", protect, adminOnly, createTask); // Create a task (Admin only)
router.put("/:id", protect, updateTask); // Update task details
router.delete("/:id", protect, adminOnly, deleteTask); // Delete a task (Admin only)
router.put("/:id/status", protect, updateTaskStatus); // Update task status
router.put("/:id/todo", protect, updateTaskChecklist); // Update task checklist
router.post("/ai-generate", protect,  upload.single("file"), generateTaskUsingAI);
router.post("/:id/comments", protect, addComment);
router.get("/user/:userId/analytics", protect,  getUserAnalyticsByAdmin);
router.post("/ai/estimate", protect,  estimateTaskUsingAI);
router.post(
  "/:taskId/subtasks/:subtaskId/upload",
  protect,
  upload.single("file"),
  uploadSubtaskFile
);


router.put(
  "/:taskId/subtasks/:subtaskId",
  protect,
  upload.single("file"),
  updateSubtask
);







module.exports = router;

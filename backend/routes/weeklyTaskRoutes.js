const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  createWeeklyTask,
  updateWeeklyTask,
  getMyCurrentWeeklyTask, getMyWeeklyHistory, getWeeklyTaskById, getWeeklyTasksByUser,
  updateWeeklyTaskStatus
} = require("../controllers/weeklyTaskController");

const router = express.Router();

router.post("/", protect, createWeeklyTask);
router.put("/:id", protect, updateWeeklyTask);
router.get("/my/current", protect, getMyCurrentWeeklyTask);
router.get("/my/history", protect, getMyWeeklyHistory);
router.get("/:id", protect, getWeeklyTaskById);
router.get(
  "/user/:userId",
  protect,
  getWeeklyTasksByUser
);

router.put("/:id/status", protect, updateWeeklyTaskStatus)


module.exports = router;

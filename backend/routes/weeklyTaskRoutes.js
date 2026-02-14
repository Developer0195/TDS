const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  createWeeklyTask,
  updateWeeklyTask,
  getMyCurrentWeeklyTask, getMyWeeklyHistory, getWeeklyTaskById
} = require("../controllers/weeklyTaskController");

const router = express.Router();

router.post("/", protect, createWeeklyTask);
router.put("/:id", protect, updateWeeklyTask);
router.get("/my/current", protect, getMyCurrentWeeklyTask);
router.get("/my/history", protect, getMyWeeklyHistory);
router.get("/:id", protect, getWeeklyTaskById);


module.exports = router;

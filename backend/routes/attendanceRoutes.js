const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

const {
  punchIn,
  punchOut,
  getMyAttendance,
} = require("../controllers/attendanceController");

router.post("/punch-in", protect, punchIn);
router.post("/punch-out", protect, punchOut);
router.get("/my", protect, getMyAttendance);

module.exports = router;

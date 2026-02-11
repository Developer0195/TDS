const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

const {
  punchIn,
  punchOut,
  getMyAttendance,
  getDailyAttendance, getTeamAttendanceAnalytics, updateAttendanceStatus, adminOverrideAttendance, offsiteCheckIn
} = require("../controllers/attendanceController");

router.post("/punch-in", protect, punchIn);
router.post("/punch-out", protect, punchOut);
router.get("/my", protect, getMyAttendance);
router.get(
  "/daily",
  protect,
  getDailyAttendance
);

router.post(
  "/check-in",
  protect, 
  offsiteCheckIn
);


router.get(
  "/team/analytics",
  protect,
  getTeamAttendanceAnalytics
);

router.put(
  "/:attendanceId/status",
  protect,
  updateAttendanceStatus
);


router.put(
  "/admin/override",
  protect,
  adminOverrideAttendance
);


module.exports = router;

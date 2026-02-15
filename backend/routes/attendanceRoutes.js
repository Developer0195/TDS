const express = require("express");
const router = express.Router();
const { protect, adminOnly, superadminOnly } = require("../middlewares/authMiddleware");

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
  adminOnly,
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
  adminOnly,
  updateAttendanceStatus
);


router.put(
  "/admin/override",
  protect,
  adminOnly, 
  adminOverrideAttendance
);


module.exports = router;

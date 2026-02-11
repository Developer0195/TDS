const cron = require("node-cron");
const User = require("../models/User");
const Attendance = require("../models/Attendance");

cron.schedule("0 0 * * *", async () => {
  try {
    // 🔁 Yesterday (important!)
    const date = new Date();
    date.setDate(date.getDate() - 1);
    date.setHours(0, 0, 0, 0);

    const users = await User.find({ role: "member" });

    for (const user of users) {
      const attendance = await Attendance.findOne({
        user: user._id,
        date,
      });

      // ❌ CASE 1: No punch-in at all
      if (!attendance) {
        await Attendance.create({
          user: user._id,
          date,
          attendanceStatus: "Absent",
        });
        continue;
      }

      // ❌ CASE 2: Punch-in exists but punch-out missing
      if (attendance.punchIn && !attendance.punchOut) {
        attendance.attendanceStatus = "Absent";
        await attendance.save();
        continue;
      }

      // ✅ CASE 3: Punch-in + punch-out exists
      // Do NOTHING (keep status as-is)
    }

    console.log("Attendance finalized for:", date.toDateString());
  } catch (error) {
    console.error("Attendance cron failed:", error);
  }
});

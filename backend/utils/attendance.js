const cron = require("node-cron");
const User = require("../models/User");
const Attendance = require("../models/Attendance");

cron.schedule("0 0 * * *", async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const users = await User.find({ role: "member", isActive: true });

  for (const user of users) {
    await Attendance.findOneAndUpdate(
      { user: user._id, date: today },
      {
        user: user._id,
        date: today,
        attendanceStatus: "Absent", // 🔥 DEFAULT
      },
      { upsert: true, new: true }
    );
  }

  console.log("Daily attendance initialized");
});

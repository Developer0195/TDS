const Attendance = require("../models/Attendance");
const Task = require("../models/Task");
const { getDistance } = require("../utils/distance");
const { isWithinAnyLocation } = require("../utils/distance");
const cloudinary = require("../config/cloudinary");
const calculateDurationMinutes = require("../utils/time");
const { OFFICE_LOCATION, RADIUS_METERS } = require("../config/geofence");
const User = require("../models/User");
const Location = require("../models/Location");

// const punchIn = async (req, res) => {
//     try {
//         const { latitude, longitude } = req.body;

//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         const existing = await Attendance.findOne({
//             user: req.user.id,
//             date: today,
//         });

//         if (existing?.punchIn?.time) {
//             return res.status(400).json({ message: "Already punched in today" });
//         }

//         const distance = getDistance(
//             latitude,
//             longitude,
//             OFFICE_LOCATION.latitude,
//             OFFICE_LOCATION.longitude
//         );

//         const status = distance <= RADIUS_METERS ? "WFO" : "WFH";

//         const attendance = await Attendance.findOneAndUpdate(
//             { user: req.user.id, date: today },
//             {
//                 user: req.user.id,
//                 date: today,
//                 punchIn: {
//                     time: new Date(),
//                     location: { latitude, longitude },
//                     distance,
//                 },
//                 status,
//             },
//             { upsert: true, new: true }
//         );

//         res.json({
//             message: "Punch in successful",
//             attendance,
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// const punchIn = async (req, res) => {
//   try {
//     const { latitude, longitude, photoBase64 } = req.body;

//     if (!photoBase64) {
//       return res.status(400).json({ message: "Photo is required" });
//     }

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const existing = await Attendance.findOne({
//       user: req.user.id,
//       date: today,
//     });

//     if (existing?.punchIn?.time) {
//       return res.status(400).json({ message: "Already punched in today" });
//     }

//     /* Upload photo */
//     const upload = await cloudinary.uploader.upload(photoBase64, {
//       folder: "attendance/punch-in",
//     });

//     const distance = getDistance(
//       latitude,
//       longitude,
//       OFFICE_LOCATION.latitude,
//       OFFICE_LOCATION.longitude
//     );

//     const workType = distance <= RADIUS_METERS ? "WFO" : "OFFSITE";

//     const attendance = await Attendance.findOneAndUpdate(
//       { user: req.user.id, date: today },
//       {
//         user: req.user.id,
//         date: today,
//         punchIn: {
//           time: new Date(),
//           location: { latitude, longitude },
//           distance,
//           photoUrl: upload.secure_url,
//         },
//         workType,
//         attendanceStatus: "Absent", // still absent until punch-out
//       },
//       { upsert: true, new: true }
//     );

//     res.json({
//       message: "Punch in successful",
//       attendance,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// const punchOut = async (req, res) => {
//     try {
//         const { latitude, longitude } = req.body;

//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         const attendance = await Attendance.findOne({
//             user: req.user.id,
//             date: today,
//         });

//         if (!attendance?.punchIn?.time) {
//             return res.status(400).json({ message: "Punch in first" });
//         }

//         if (attendance?.punchOut?.time) {
//             return res.status(400).json({ message: "Already punched out" });
//         }

//         const distance = getDistance(
//             latitude,
//             longitude,
//             OFFICE_LOCATION.latitude,
//             OFFICE_LOCATION.longitude
//         );

//         const punchOutTime = new Date();
//         const durationMinutes = calculateDurationMinutes(
//             attendance.punchIn.time,
//             punchOutTime
//         );

//         attendance.punchOut = {
//             time: punchOutTime,
//             location: { latitude, longitude },
//             distance,
//         };

//         attendance.totalDurationMinutes = durationMinutes;

//         await attendance.save();

//         res.json({
//             message: "Punch out successful",
//             attendance,
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

const punchIn = async (req, res) => {
  try {
    const { latitude, longitude, photoBase64, remarks } = req.body;

    if (!photoBase64) {
      return res.status(400).json({ message: "Photo is required" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({
      user: req.user.id,
      date: today,
    });

    if (existing?.punchIn?.time) {
      return res.status(400).json({ message: "Already punched in today" });
    }

    /* 📸 Upload photo */
    const upload = await cloudinary.uploader.upload(photoBase64, {
      folder: "attendance/punch-in",
    });

    /* 🔹 Fetch user + assigned locations */
    const user = await User.findById(req.user.id).populate("assignedLocations");

    let workType = "OFFSITE";
    let distance = null;

    /* 🔹 CASE 1: Assigned locations exist */
    if (user.assignedLocations?.length > 0) {
      const match = isWithinAnyLocation(
        latitude,
        longitude,
        user.assignedLocations,
      );

      if (match.matched) {
        workType = "WFO";
        distance = match.distance;
      }
    } else {
    /* 🔹 CASE 2: Fallback to default office */
      distance = getDistance(
        latitude,
        longitude,
        OFFICE_LOCATION.latitude,
        OFFICE_LOCATION.longitude,
      );

      if (distance <= RADIUS_METERS) {
        workType = "WFO";
      }
    }

    /* OFFSITE → remarks mandatory */
    if (workType === "OFFSITE" && !remarks) {
      return res.status(400).json({
        message: "Remarks are required for offsite work",
      });
    }

    const attendance = await Attendance.create({
      user: req.user.id,
      date: today,
      punchIn: {
        time: new Date(),
        location: { latitude, longitude },
        distance,
        photoUrl: upload.secure_url,
        remarks: workType === "OFFSITE" ? remarks : undefined,
      },
      workType,
      attendanceStatus: "Absent",
      offsiteCheckins: [],
    });

    res.json({
      message: "Punch in successful",
      attendance,
      requiresCheckins: workType === "OFFSITE",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const punchOut = async (req, res) => {
  try {
    const { latitude, longitude, photoBase64 } = req.body;

    if (!photoBase64) {
      return res.status(400).json({ message: "Photo is required" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const attendance = await Attendance.findOne({
      user: req.user.id,
      date: today,
    });

    if (!attendance?.punchIn?.time) {
      return res.status(400).json({ message: "Punch in first" });
    }

    if (attendance?.punchOut?.time) {
      return res.status(400).json({ message: "Already punched out" });
    }

    /* 🔴 CHECK OVERDUE SUBTASKS (CARRY FORWARD) */
    const pendingSubTasks = await Task.aggregate([
      { $unwind: "$todoCheckList" },
      {
        $match: {
          "todoCheckList.assignedTo": attendance.user,
          "todoCheckList.completed": false,
          dueDate: { $lte: endOfToday },
        },
      },
    ]);

    if (pendingSubTasks.length > 0) {
      attendance.attendanceStatus = "Delayed";
      await attendance.save();

      return res.status(400).json({
        message:
          "You have overdue or incomplete subtasks. Complete them before punching out.",
        attendanceStatus: "Delayed",
        pendingCount: pendingSubTasks.length,
      });
    }

    /* 📸 Upload photo */
    const upload = await cloudinary.uploader.upload(photoBase64, {
      folder: "attendance/punch-out",
    });

    const punchOutTime = new Date();
    const durationMinutes = calculateDurationMinutes(
      attendance.punchIn.time,
      punchOutTime,
    );

    const distance = getDistance(
      latitude,
      longitude,
      OFFICE_LOCATION.latitude,
      OFFICE_LOCATION.longitude,
    );

    attendance.punchOut = {
      time: punchOutTime,
      location: { latitude, longitude },
      distance,
      photoUrl: upload.secure_url,
    };

    attendance.totalDurationMinutes = durationMinutes;
    attendance.attendanceStatus = "Present";

    await attendance.save();

    res.json({
      message: "Punch out successful",
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const offsiteCheckIn = async (req, res) => {
  try {
    const { latitude, longitude, photoBase64 } = req.body;

    if (!photoBase64) {
      return res.status(400).json({
        message: "Photo is required for check-in",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      user: req.user.id,
      date: today,
    });

    /* Must punch in first */
    if (!attendance || !attendance.punchIn?.time) {
      return res.status(400).json({
        message: "Punch in required before check-in",
      });
    }

    /* Only OFFSITE users */
    if (attendance.workType !== "OFFSITE") {
      return res.status(400).json({
        message: "Check-ins are only required for offsite work",
      });
    }

    const checkins = attendance.offsiteCheckins || [];

    /* Max 3 check-ins */
    if (checkins.length >= 3) {
      return res.status(400).json({
        message: "Maximum offsite check-ins completed",
      });
    }

    /* Enforce 2-hour gap */
    const now = new Date();

    /* ⛔ FIRST CHECK-IN → must be 2 hours after punch-in */
    if (checkins.length === 0) {
      const punchInTime = new Date(attendance.punchIn.time);

      const diffMinutes = (now.getTime() - punchInTime.getTime()) / (1000 * 60);

      if (diffMinutes < 120) {
        return res.status(400).json({
          message: "First check-in allowed after 2 hours from punch-in",
          nextAllowedInMinutes: Math.ceil(120 - diffMinutes),
        });
      }
    }

    /* ⛔ NEXT CHECK-INS → must be 2 hours after last check-in */
    if (checkins.length > 0) {
      const lastCheckinTime = new Date(checkins[checkins.length - 1].time);

      const diffMinutes =
        (now.getTime() - lastCheckinTime.getTime()) / (1000 * 60);

      if (diffMinutes < 120) {
        return res.status(400).json({
          message: "Next check-in allowed after 2 hours",
          nextAllowedInMinutes: Math.ceil(120 - diffMinutes),
        });
      }
    }

    /* 📸 Upload photo */
    const upload = await cloudinary.uploader.upload(photoBase64, {
      folder: "attendance/offsite-checkins",
    });

    /* 📍 Distance from default office (optional, for audit) */
    const distance = getDistance(
      latitude,
      longitude,
      OFFICE_LOCATION.latitude,
      OFFICE_LOCATION.longitude,
    );

    /* ✅ Save check-in */
    attendance.offsiteCheckins.push({
      time: new Date(),
      location: {
        latitude,
        longitude,
        distance,
      },
      photoUrl: upload.secure_url,
    });

    await attendance.save();

    res.json({
      message: "Offsite check-in recorded",
      checkinsCompleted: attendance.offsiteCheckins.length,
      remaining: 3 - attendance.offsiteCheckins.length,
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const getMyAttendance = async (req, res) => {
//     try {
//         const attendance = await Attendance.find({
//             user: req.user.id,
//         }).sort({ date: -1 });

//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         const todayRecord = attendance.find(
//             (a) => a.date.getTime() === today.getTime()
//         );

//         res.json({
//             today: todayRecord,
//             attendance,
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

const getMyAttendance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {
      user: req.user.id,
    };

    // 🔹 Date range filter (optional)
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      query.date = { $gte: start, $lte: end };
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });

    // 🔹 Today record (independent of range)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayRecord = await Attendance.findOne({
      user: req.user.id,
      date: today,
    });

    res.json({
      today: todayRecord,
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const getDailyAttendance = async (req, res) => {
//   try {
//     const { date } = req.query;

//     const selectedDate = date
//       ? new Date(date)
//       : new Date();

//     selectedDate.setHours(0, 0, 0, 0);

//     /* 🔹 Admin team members only */
//     const admin = await User.findById(req.user._id).populate(
//       "teamMembers",
//       "name"
//     );

//     const teamMembers = admin.teamMembers || [];

//     const attendanceRecords = await Attendance.find({
//       user: { $in: teamMembers.map(m => m._id) },
//       date: selectedDate,
//     }).populate("user", "name");

//     const rows = teamMembers.map(member => {
//       const record = attendanceRecords.find(
//         a => a.user._id.toString() === member._id.toString()
//       );

//       if (!record || !record.punchIn?.time) {
//         return {
//           userId: member._id,
//           name: member.name,
//           attendanceStatus: "Absent",
//         };
//       }

//       console.log(record.punchOut)

//       if (record.punchIn && !record.punchOut?.time) {
//         return {
//           userId: member._id,
//           name: member.name,
//           punchInTime: record.punchIn.time,
//           status: record.status,
//           attendanceStatus: "Absent",
//         //   location: {
//         //     latitude: record.punchIn.location?.latitude,
//         //     longitude: record.punchIn.location?.longitude,
//         //     distance: record.punchIn.distance,
//         //   },
//         };
//       }

//       return {
//         userId: member._id,
//         name: member.name,
//         punchInTime: record.punchIn.time,
//         punchOutTime: record.punchOut.time,
//         durationMinutes: record.totalDurationMinutes,
//         status: record.status,
//         attendanceStatus: "Present",
//         location: {
//           latitude: record.punchIn.location?.latitude,
//           longitude: record.punchIn.location?.longitude,
//           distance: record.punchIn.distance,
//         },
//       };
//     });

//     res.json({
//       date: selectedDate,
//       rows,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const getDailyAttendance = async (req, res) => {
  try {
    const { date } = req.query;

    const selectedDate = date ? new Date(date) : new Date();
    selectedDate.setHours(0, 0, 0, 0);

    /* 🔹 Admin + team members */
    const admin = await User.findById(req.user._id).populate(
      "teamMembers",
      "name",
    );

    const teamMembers = admin.teamMembers || [];

    /* 🔹 Attendance records for the day */
    const attendanceRecords = await Attendance.find({
      user: { $in: teamMembers.map((m) => m._id) },
      date: selectedDate,
    }).lean();

    const rows = teamMembers.map((member) => {
      const record = attendanceRecords.find(
        (a) => a.user.toString() === member._id.toString(),
      );

      /* 🔹 No record = Absent */
      if (!record) {
        return {
          userId: member._id,
          name: member.name,
          attendanceStatus: "Absent",
        };
      }

      return {
        userId: member._id,
        name: member.name,

        punchInTime: record.punchIn?.time || null,
        punchOutTime: record.punchOut?.time || null,
        durationMinutes: record.totalDurationMinutes || null,

        workType: record.workType || null, // WFO | OFFSITE
        attendanceStatus: record.attendanceStatus, // Present | Absent | Delayed

        location: record.punchIn?.location
          ? {
              latitude: record.punchIn.location.latitude,
              longitude: record.punchIn.location.longitude,
              distance: record.punchIn.distance,
            }
          : null,

        overriddenByAdmin: record.overriddenByAdmin || false,
        remarks: record.punchIn?.remarks || null,
      };
    });

    res.json({
      date: selectedDate,
      rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const getTeamAttendanceAnalytics = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;

//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     start.setHours(0, 0, 0, 0);
//     end.setHours(23, 59, 59, 999);

//     const admin = await User.findById(req.user._id).populate(
//       "teamMembers",
//       "name email"
//     );

//     const teamMembers = admin.teamMembers || [];

//     const attendanceRecords = await Attendance.find({
//       user: { $in: teamMembers.map((m) => m._id) },
//       date: { $gte: start, $lte: end },
//     }).lean();

//     const result = teamMembers.map((member) => {
//       const memberRecords = attendanceRecords.filter(
//         (a) => a.user.toString() === member._id.toString()
//       );

//       // 🔹 Build full date range
//       const allDates = [];
//       const cursor = new Date(start);
//       cursor.setHours(0, 0, 0, 0);

//       while (cursor <= end) {
//         allDates.push(new Date(cursor));
//         cursor.setDate(cursor.getDate() + 1);
//       }

//       // Map attendance by date
//       const recordMap = {};
//       memberRecords.forEach((a) => {
//         recordMap[new Date(a.date).toDateString()] = a;
//       });

//       let presentDays = 0;
//       let absentDays = 0;
//       let delayedDays = 0;

//       allDates.forEach((d) => {
//         const rec = recordMap[d.toDateString()];
//         if (!rec) {
//           absentDays++;
//         } else if (rec.attendanceStatus === "Present") {
//           presentDays++;
//         } else if (rec.attendanceStatus === "Delayed") {
//           delayedDays++;
//         } else {
//           absentDays++;
//         }
//       });

//       // 🔹 Calendar (only existing records, UI fills gaps)
//       const calendar = memberRecords.map((a) => ({
//         attendanceId: a._id,
//         date: a.date,
//         status: a.attendanceStatus,
//         overriddenByAdmin: a.overriddenByAdmin || false,
//       }));

//       return {
//         userId: member._id,
//         name: member.name,
//         stats: {
//           presentDays,
//           absentDays,
//           delayedDays,
//         },
//         calendar,
//       };
//     });

//     res.json({
//       range: { startDate: start, endDate: end },
//       members: result,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const getTeamAttendanceAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = new Date(startDate);
    const rawEnd = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    rawEnd.setHours(23, 59, 59, 999);

    // 🔹 Clamp end date to TODAY
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const effectiveEnd = rawEnd > today ? today : rawEnd;

    const admin = await User.findById(req.user._id).populate(
      "teamMembers",
      "name email",
    );

    const teamMembers = admin.teamMembers || [];

    const attendanceRecords = await Attendance.find({
      user: { $in: teamMembers.map((m) => m._id) },
      date: { $gte: start, $lte: effectiveEnd },
    }).lean();

    const result = teamMembers.map((member) => {
      const memberRecords = attendanceRecords.filter(
        (a) => a.user.toString() === member._id.toString(),
      );

      /* 🔹 Build date range ONLY till today */
      const allDates = [];
      const cursor = new Date(start);
      cursor.setHours(0, 0, 0, 0);

      while (cursor <= effectiveEnd) {
        allDates.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }

      /* 🔹 Map records */
      const recordMap = {};
      memberRecords.forEach((a) => {
        recordMap[new Date(a.date).toDateString()] = a;
      });

      let presentDays = 0;
      let absentDays = 0;
      let delayedDays = 0;

      allDates.forEach((d) => {
        const rec = recordMap[d.toDateString()];

        if (!rec) {
          absentDays++; // ✅ only past days exist here
        } else if (rec.attendanceStatus === "Present") {
          presentDays++;
        } else if (rec.attendanceStatus === "Delayed") {
          delayedDays++;
        } else {
          absentDays++;
        }
      });

      const calendar = memberRecords.map((a) => ({
        attendanceId: a._id,
        date: a.date,
        status: a.attendanceStatus,
        overriddenByAdmin: a.overriddenByAdmin || false,
      }));

      return {
        userId: member._id,
        name: member.name,
        stats: {
          presentDays,
          absentDays,
          delayedDays,
        },
        calendar,
      };
    });

    res.json({
      range: {
        startDate: start,
        endDate: effectiveEnd,
      },
      members: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAttendanceStatus = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { attendanceStatus, reason } = req.body;

    if (!["Present", "Absent", "Delayed"].includes(attendanceStatus)) {
      return res.status(400).json({ message: "Invalid attendance status" });
    }

    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    attendance.attendanceStatus = attendanceStatus;
    attendance.overriddenByAdmin = true;
    attendance.overrideReason = reason || "";

    await attendance.save();

    res.json({
      message: "Attendance status updated",
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const adminOverrideAttendance = async (req, res) => {
  try {
    const { userId, date, attendanceStatus, reason } = req.body;

    if (!userId || !date || !attendanceStatus) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const targetDate = new Date(`${date}T00:00:00.000Z`);

    targetDate.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      { user: userId, date: targetDate },
      {
        user: userId,
        date: targetDate,
        attendanceStatus,
        overriddenByAdmin: true,
        overrideReason: reason || "",
      },
      {
        upsert: true, // ✅ create if missing
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    res.json({
      message: "Attendance updated",
      attendance,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  punchIn,
  punchOut,
  getMyAttendance,
  offsiteCheckIn,
  getDailyAttendance,
  getTeamAttendanceAnalytics,
  updateAttendanceStatus,
  adminOverrideAttendance,
};

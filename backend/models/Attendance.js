const mongoose = require("mongoose");

// const AttendanceSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     date: {
//       type: Date,
//       required: true,
//     },

//     /* ---------------- PUNCH IN ---------------- */
//     punchIn: {
//       time: Date,
//       location: {
//         latitude: Number,
//         longitude: Number,
//       },
//       distance: Number,
//       photoUrl: String,
//     },

//     /* ---------------- PUNCH OUT ---------------- */
//     punchOut: {
//       time: Date,
//       location: {
//         latitude: Number,
//         longitude: Number,
//       },
//       distance: Number,
//       photoUrl: String,
//     },

//     /* ---------------- WORK MODE ---------------- */
//     workType: {
//       type: String,
//       enum: ["WFO", "OFFSITE"],
//     },

//     /* ---------------- ATTENDANCE STATUS ---------------- */
//     attendanceStatus: {
//       type: String,
//       enum: ["Absent", "Present", "Delayed"],
//       default: "Absent",
//       index: true,
//     },

//     /* ---------------- CALCULATED ---------------- */
//     totalDurationMinutes: Number,

//     /* ---------------- ADMIN OVERRIDE ---------------- */
//     overriddenByAdmin: {
//       type: Boolean,
//       default: false,
//     },

//     overrideReason: String,
//   },
//   { timestamps: true }
// );

// AttendanceSchema.index({ user: 1, date: 1 }, { unique: true });

// module.exports = mongoose.model("Attendance", AttendanceSchema);




const AttendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },

  punchIn: {
    time: Date,
    location: {
      latitude: Number,
      longitude: Number,
    },
    distance: Number,
    photoUrl: String,
    remarks: String, // 🔴 REQUIRED if OFFSITE
  },

  punchOut: { /* unchanged */ },

  workType: {
    type: String,
    enum: ["WFO", "OFFSITE"],
  },

  /* 🔹 OFFSITE CHECK-INS */
  offsiteCheckins: [
    {
      time: { type: Date, required: true },
      location: {
        latitude: Number,
        longitude: Number,
      },
      photoUrl: String,
    },
  ],

  totalDurationMinutes: Number,

  attendanceStatus: {
    type: String,
    enum: ["Absent", "Present", "Delayed", "Holiday"],
    default: "Absent",
    index: true,
  },

  overriddenByAdmin: { type: Boolean, default: false },
  overrideReason: String,
}, { timestamps: true });

AttendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", AttendanceSchema);


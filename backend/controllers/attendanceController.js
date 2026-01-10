const Attendance = require("../models/Attendance");
const getDistance = require("../utils/distance");
const calculateDurationMinutes = require("../utils/time");
const { OFFICE_LOCATION, RADIUS_METERS } = require("../config/geofence");

const punchIn = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existing = await Attendance.findOne({
            user: req.user.id,
            date: today,
        });

        if (existing?.punchIn?.time) {
            return res.status(400).json({ message: "Already punched in today" });
        }

        const distance = getDistance(
            latitude,
            longitude,
            OFFICE_LOCATION.latitude,
            OFFICE_LOCATION.longitude
        );

        const status = distance <= RADIUS_METERS ? "WFO" : "WFH";

        const attendance = await Attendance.findOneAndUpdate(
            { user: req.user.id, date: today },
            {
                user: req.user.id,
                date: today,
                punchIn: {
                    time: new Date(),
                    location: { latitude, longitude },
                    distance,
                },
                status,
            },
            { upsert: true, new: true }
        );

        res.json({
            message: "Punch in successful",
            attendance,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const punchOut = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

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

        const distance = getDistance(
            latitude,
            longitude,
            OFFICE_LOCATION.latitude,
            OFFICE_LOCATION.longitude
        );

        const punchOutTime = new Date();
        const durationMinutes = calculateDurationMinutes(
            attendance.punchIn.time,
            punchOutTime
        );

        attendance.punchOut = {
            time: punchOutTime,
            location: { latitude, longitude },
            distance,
        };

        attendance.totalDurationMinutes = durationMinutes;

        await attendance.save();

        res.json({
            message: "Punch out successful",
            attendance,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({
            user: req.user.id,
        }).sort({ date: -1 });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayRecord = attendance.find(
            (a) => a.date.getTime() === today.getTime()
        );

        res.json({
            today: todayRecord,
            attendance,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { punchIn, punchOut, getMyAttendance };

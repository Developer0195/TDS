require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const connectDB = require("./config/db");

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const taskRoutes = require('./routes/taskRoutes')
const reportRoutes = require('./routes/reportRoutes')
const attendanceRoutes = require("./routes/attendanceRoutes");
const cloudinary = require("./config/cloudinary");
const uploadRoutes = require("./routes/uploadRoutes");
const projectRoutes = require("./routes/projectRoutes");
const locationRoutes = require("./routes/locationRoutes.js");
const weeklyTaskRoutes = require("./routes/weeklyTaskRoutes.js");

require("./utils/attendance.js")


// Middleware to handle CORS
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

//Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());


//Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/locations", locationRoutes)
app.use("/api/weekly-tasks", weeklyTaskRoutes);



//Server uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

app.get("/test-cloudinary", async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload(
            "https://res.cloudinary.com/demo/image/upload/sample.jpg"
        );

        res.json({ success: true, url: result.secure_url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

// ✅ Create Project
router.post("/create", protect, createProject);

// ✅ Get All Projects
router.get("/", protect, getProjects);

// ✅ Get Single Project
router.get("/:id", protect, getProjectById);

// ✅ Update Project
router.put("/:id", protect, updateProject);

// ✅ Delete Project
router.delete("/:id", protect, deleteProject);

module.exports = router;

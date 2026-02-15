const express = require("express");
const router = express.Router();

const { protect, adminOnly, superadminOnly} = require("../middlewares/authMiddleware");

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

// ✅ Create Project
router.post("/create", protect, adminOnly,  createProject);

// ✅ Get All Projects
router.get("/", protect, getProjects);

// ✅ Get Single Project
router.get("/:id", protect, getProjectById);

// ✅ Update Project
router.put("/:id", protect, adminOnly, updateProject);

// ✅ Delete Project
router.delete("/:id", protect, adminOnly, deleteProject);

module.exports = router;

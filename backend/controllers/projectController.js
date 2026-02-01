const Project = require("../models/Project");
const Task = require("../models/Task");


/* ===============================
   CREATE PROJECT
================================ */
const createProject = async (req, res) => {
  try {
    const { name, description, members = [] } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members,
    });

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   GET ALL PROJECTS
================================ */
const getProjects = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "admin") {
      filter.createdBy = req.user._id;
    }

    const projects = await Project.find(filter)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   GET PROJECT BY ID
================================ */
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   UPDATE PROJECT
================================ */
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Only creator/admin can update
    if (req.user.role === "admin" && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    Object.assign(project, req.body);
    await project.save();

    res.status(200).json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   DELETE PROJECT
================================ */
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await Task.updateMany(
      { project: project._id },
      { $set: { project: null } }
    );

    await project.deleteOne();

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};

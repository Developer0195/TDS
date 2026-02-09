const Project = require("../models/Project");
const Task = require("../models/Task");


/* ===============================
   CREATE PROJECT
================================ */
const createProject = async (req, res) => {
  try {
    const { name, description, clientName, members = [] } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const project = await Project.create({
      name,
      description,
      clientName: clientName?.trim() || "",
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
// const getProjects = async (req, res) => {
//   try {
//     let filter = {};

//     if (req.user.role === "admin") {
//       filter.createdBy = req.user._id;
//     }

//     const projects = await Project.find(filter)
//       .populate("createdBy", "name email")
//       .populate("members", "name email");

//     res.status(200).json({ projects });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


const getProjects = async (req, res) => {
  try {
    const {
      status,
      search,
      clientName,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    /* ===============================
       ROLE-BASED ACCESS
    =============================== */
    if (req.user.role === "admin") {
      filter.createdBy = req.user._id;
    }

    /* ===============================
       STATUS FILTER
    =============================== */
    if (status) {
      filter.status = status;
    }

    /* ===============================
       CLIENT NAME FILTER
    =============================== */
    if (clientName) {
      filter.clientName = { $regex: clientName, $options: "i" };
    }

    /* ===============================
       SEARCH (PROJECT NAME OR CLIENT)
    =============================== */
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { clientName: { $regex: search, $options: "i" } },
      ];
    }

    /* ===============================
       CREATION DATE FILTER
    =============================== */
    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    /* ===============================
       PAGINATION
    =============================== */
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    const [projects, totalItems] = await Promise.all([
      Project.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate("createdBy", "name email")
        .populate("members", "name email profileImageUrl"),

      Project.countDocuments(filter),
    ]);

    /* ===============================
       RESPONSE
    =============================== */
    res.status(200).json({
      projects,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalItems / pageSize),
        totalItems,
        limit: pageSize,
      },
    });
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

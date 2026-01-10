const express = require("express");
const { adminOnly, protect } = require("../middlewares/authMiddleware");
const { getUsers, getUserById, deleteUser, getMyProfile, updateMyProfile } = require("../controllers/userController");

const router = express.Router();

// User Management Routes
router.get("/", protect, adminOnly, getUsers); // Get all users (Admin only)
router.get("/:id", protect, getUserById); // Get a specific user
router.delete("/:id", protect, adminOnly, deleteUser); // Delete user (Admin only)
router.get("/me/profile", protect, getMyProfile);
router.put("/me/profile", protect, updateMyProfile);


module.exports = router;
// const express = require("express");
// const { adminOnly, protect } = require("../middlewares/authMiddleware");
// const { getUsers, getUserById, deleteUser, getMyProfile, updateMyProfile, getAdminTeamMembers, addTeamMember, removeTeamMember } = require("../controllers/userController");

// const router = express.Router();

// // User Management Routes
// router.get("/", protect, adminOnly, getUsers); // Get all users (Admin only)
// router.get("/:id", protect, getUserById); // Get a specific user
// router.delete("/:id", protect, adminOnly, deleteUser); // Delete user (Admin only)
// router.get("/me/profile", protect, getMyProfile);
// router.put("/me/profile", protect, updateMyProfile);

// router.get("/team", protect, getAdminTeamMembers);
// router.post("/team", protect, addTeamMember);
// router.delete("/team/:memberId", protect, removeTeamMember);



// module.exports = router;



const express = require("express");
const { adminOnly, superadminOnly, protect } = require("../middlewares/authMiddleware");

const {
  getUsers,
  getUserById,
  deleteUser,
  getMyProfile,
  updateMyProfile,

  getAdminTeamMembers,
  addTeamMember,
  removeTeamMember,
  searchUsers,
  getUserAnalytics,
  getAssignableUsers,
  getAllUsersForSuperadmin
} = require("../controllers/userController");

const router = express.Router();

/* =========================
   AUTH / PROFILE
========================= */
router.get("/me/profile", protect, getMyProfile);
router.put("/me/profile", protect, updateMyProfile);

/* =========================
   TEAM MANAGEMENT (ADMIN)
========================= */
router.get("/team", protect, adminOnly, getAdminTeamMembers);
router.post("/team", protect,  adminOnly, addTeamMember);
router.delete("/team/:memberId", protect, adminOnly, removeTeamMember);

/* =========================
   SEARCH USERS (ADMIN)
========================= */
router.get("/search", protect, adminOnly,  searchUsers);

/* =========================
   USER MANAGEMENT
========================= */
router.get(
  "/assignable-users",
  protect,
  getAssignableUsers
);

router.get(
  "/superadmin",
  protect,
  superadminOnly, 
  getAllUsersForSuperadmin
);

router.get("/", protect, getUsers);
router.delete("/:id", protect, adminOnly, deleteUser);
router.get("/:id", protect, getUserById);

router.get(
  "/:id/analytics",
  protect,
  getUserAnalytics
);




module.exports = router;

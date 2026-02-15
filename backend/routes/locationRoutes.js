const express = require("express");
const router = express.Router();
const locationController = require("../controllers/locationController");
const { protect, adminOnly, superadminOnly } = require("../middlewares/authMiddleware");

// Admin only
router.post("/", protect, adminOnly, locationController.createLocation);

router.delete(
  "/:locationId",
protect,
adminOnly, 
  locationController.deleteLocation
);

// Assign locations to user
router.put(
  "/assign/:userId",
  protect,
  adminOnly, 
  locationController.assignLocationsToUser
);

router.get(
  "/",
  protect,
  locationController.getAllLocations
);


module.exports = router;

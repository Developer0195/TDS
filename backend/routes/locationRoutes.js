const express = require("express");
const router = express.Router();
const locationController = require("../controllers/locationController");
const { protect } = require("../middlewares/authMiddleware");

// Admin only
router.post("/", protect, locationController.createLocation);

router.delete(
  "/:locationId",
protect,
  locationController.deleteLocation
);

// Assign locations to user
router.put(
  "/assign/:userId",
  protect,
  locationController.assignLocationsToUser
);

router.get(
  "/",
  protect,
  locationController.getAllLocations
);


module.exports = router;

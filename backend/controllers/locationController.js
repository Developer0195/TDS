const Location = require("../models/Location");
const User = require("../models/User");

/* ===============================
   CREATE LOCATION (ADMIN)
================================ */
exports.createLocation = async (req, res) => {
  try {
    const { name, address, latitude, longitude, radiusInMeters } = req.body;

    if (!name || latitude == null || longitude == null || !radiusInMeters) {
      return res.status(400).json({
        message: "Name, latitude, longitude and radius are required",
      });
    }

    const location = await Location.create({
      name,
      address,
      coordinates: {
        latitude,
        longitude,
      },
      radiusInMeters,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Location created successfully",
      location,
    });
  } catch (error) {
    console.error("Create location error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


/* ===============================
   DELETE LOCATION (ADMIN)
================================ */
exports.deleteLocation = async (req, res) => {
  try {
    const { locationId } = req.params;

    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    // Soft delete
    location.isActive = false;
    await location.save();

    // Remove location from all users
    await User.updateMany(
      { assignedLocations: locationId },
      { $pull: { assignedLocations: locationId } }
    );

    res.json({
      message: "Location deleted and unassigned from users",
    });
  } catch (error) {
    console.error("Delete location error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


/* ===================================
   ASSIGN LOCATIONS TO USER (ADMIN)
=================================== */
exports.assignLocationsToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { locationIds } = req.body; // array of location IDs

    if (!Array.isArray(locationIds)) {
      return res.status(400).json({
        message: "locationIds must be an array",
      });
    }

    if (locationIds.length > 5) {
      return res.status(400).json({
        message: "Maximum 5 locations can be assigned",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if all locations exist & are active
    const locationsCount = await Location.countDocuments({
      _id: { $in: locationIds },
      isActive: true,
    });

    if (locationsCount !== locationIds.length) {
      return res.status(400).json({
        message: "One or more locations are invalid or inactive",
      });
    }

    // Remove duplicates just in case
    const uniqueLocations = [...new Set(locationIds)];

    user.assignedLocations = uniqueLocations;
    await user.save();

    res.json({
      message: "Locations assigned successfully",
      assignedLocations: uniqueLocations,
    });
  } catch (error) {
    console.error("Assign location error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


/* ===============================
   GET ALL LOCATIONS (ADMIN)
================================ */
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true })
      .sort({ createdAt: -1 });

    res.json({ locations });
  } catch (error) {
    console.error("Get locations error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


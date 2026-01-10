const express = require("express");
const multer = require("multer");
const { uploadAttachment } = require("../controllers/uploadController");

const router = express.Router();

// Use memory storage (required for Cloudinary stream)
const upload = multer({
  storage: multer.memoryStorage(),
});

// ===============================
// ROUTES
// ===============================
router.post(
  "/attachment",
  upload.single("file"),
  uploadAttachment
);

module.exports = router;

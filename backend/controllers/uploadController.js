const cloudinary = require("../config/cloudinary");

// ===============================
// UPLOAD ATTACHMENT TO CLOUDINARY
// ===============================
const uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file provided",
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "task-attachments" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({
            message: "Cloudinary upload failed",
          });
        }

        res.status(200).json({
          url: result.secure_url,
          name: req.file.originalname,
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error("Upload attachment error:", error);
    res.status(500).json({
      message: "Upload failed",
    });
  }
};

module.exports = {
  uploadAttachment,
};

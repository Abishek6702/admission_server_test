const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// 🔹 Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🔹 Setup Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "mern-applications", // Folder in your Cloudinary account
    allowed_formats: ["jpeg", "jpg", "png", "pdf"], // allowed file types
    resource_type: "auto", // handles image/pdf uploads automatically
  },
});

// 🔹 File Filter (reuse your existing logic)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpeg, .jpg, .png, .pdf allowed"));
  }
};

// 🔹 Create Multer Upload Middleware
const upload = multer({ storage, fileFilter });

module.exports = upload;

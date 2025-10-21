import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// ===============================
// MULTER STORAGE (Cloudinary)
// ===============================
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "electro_uploads", // Thư mục trong Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ quality: "auto" }],
  },
});

const upload = multer({ storage });

// ===============================
// API: Upload Single Image
// ===============================
router.post(
  "/upload",
  authenticate,
  authorize("ADMIN"),
  upload.single("image"),
  (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: "No file uploaded" });

      res.json({
        message: "Image uploaded successfully",
        url: req.file.path, // Cloudinary URL
        public_id: req.file.filename, // ID trên Cloudinary
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// ===============================
// API: Upload Multiple Images
// ===============================
router.post(
  "/upload-multiple",
  authenticate,
  authorize("ADMIN"),
  upload.array("images", 10),
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0)
        return res.status(400).json({ message: "No files uploaded" });

      const images = req.files.map((file) => ({
        name: file.originalname || file.filename, // Tên file gốc
        path: file.path, // URL Cloudinary
        contentType: file.mimetype,
        size: file.size,
        public_id: file.filename, // ID trên Cloudinary
      }));

      res.json({
        message: "Images uploaded successfully",
        images, // ✅ Trả về mảng đầy đủ các trường
      });

      res.json({
        message: "Images uploaded successfully",
        images,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
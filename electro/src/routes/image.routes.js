import express from "express"
const router = express.Router()
import multer from "multer"
import path from "path"
import { authenticate, authorize } from "../middleware/auth.js"

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/
    const mimetype = filetypes.test(file.mimetype)
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())

    if (mimetype && extname) {
      return cb(null, true)
    }
    cb(new Error("Only image files are allowed!"))
  },
})

// Upload single image
router.post("/upload", authenticate, authorize("ADMIN"), upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const imageUrl = `/uploads/${req.file.filename}`
    res.json({
      message: "Image uploaded successfully",
      url: imageUrl,
      filename: req.file.filename,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Upload multiple images
router.post("/upload-multiple", upload.array("images", 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" })
    }

    const imageUrls = req.files.map((file) => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
    }))

    res.json({
      message: "Images uploaded successfully",
      images: imageUrls,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router

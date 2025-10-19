import express from "express"
const router = express.Router()
import categoryController from "../controllers/category.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

// Public routes
router.get("/", categoryController.getAllCategories)
router.get("/slug/:slug", categoryController.getCategoryBySlug)
router.get("/:id", authenticate, categoryController.getCategoryById)

// authenticateed routes - Admin only
router.post("/", authenticate, authorize("ADMIN"), categoryController.createCategory)
router.put("/:id", authenticate, authorize("ADMIN"), categoryController.updateCategory)
router.delete("/:id", authenticate, authorize("ADMIN"), categoryController.deleteCategory)

export default router

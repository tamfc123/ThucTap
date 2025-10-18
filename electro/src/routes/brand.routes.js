import express from "express"
const router = express.Router()
import  brandController from "../controllers/brand.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

// Public routes
router.get("/", brandController.getAllBrands)
router.get("/:id", brandController.getBrandById)

// authenticateed routes - Admin only
router.post("/", authenticate, authorize("ADMIN"), brandController.createBrand)
router.put("/:id", authenticate, authorize("ADMIN"), brandController.updateBrand)
router.delete("/:id", authenticate, authorize("ADMIN"), brandController.deleteBrand)

export default router

import express from "express"
const router = express.Router()
import  productController from "../controllers/product.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

// Public routes
router.get("/", productController.getAllProducts)
router.get("/slug/:slug", productController.getProductBySlug)
router.get("/:id", productController.getProductById)

// authenticateed routes - Admin only
router.post("/", authenticate, authorize("ADMIN"), productController.createProduct)
router.put("/:id", authenticate, authorize("ADMIN"), productController.updateProduct)
router.delete("/:id", authenticate, authorize("ADMIN"), productController.deleteProduct)

export default router

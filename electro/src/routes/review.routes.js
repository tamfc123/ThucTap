import express from "express"
const router = express.Router()
import reviewController from "../controllers/review.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

// Public routes
router.get("/product/:productId", reviewController.getProductReviews)

// authenticateed routes - User
router.post("/", authenticate, reviewController.createReview)
router.put("/:id", authenticate, reviewController.updateReview)
router.delete("/:id", authenticate, reviewController.deleteReview)

// authenticateed routes - Admin
router.get("/", authenticate, authorize("ADMIN"), reviewController.getAllReviews)

export default router

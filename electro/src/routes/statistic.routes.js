import express from "express"
const router = express.Router()
import statisticController from "../controllers/statistic.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

// authenticateed routes - Admin only
router.get("/dashboard", authenticate, authorize("ADMIN"), statisticController.getDashboardStats)
router.get("/revenue", authenticate, authorize("ADMIN"), statisticController.getRevenueStats)
router.get("/products", authenticate, authorize("ADMIN"), statisticController.getProductStats)
router.get("/customers", authenticate, authorize("ADMIN"), statisticController.getCustomerStats)

export default router

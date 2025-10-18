import express from "express"
const router = express.Router()
import  paymentMethodController from "../controllers/payment-method.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

// Public routes
router.get("/", paymentMethodController.getAll)
router.get("/:id", paymentMethodController.getById)

// Admin routes
router.post("/", authenticate, authorize("ADMIN"), paymentMethodController.create)
router.put("/:id", authenticate, authorize("ADMIN"), paymentMethodController.update)
router.delete("/", authenticate, authorize("ADMIN"), paymentMethodController.deleteMany)

export default router

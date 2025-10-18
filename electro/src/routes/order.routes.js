import express from "express"
const router = express.Router()
import { authenticate, authorize } from "../middleware/auth.js"
import orderController from "../controllers/order.controllelr.js"

// authenticateed routes - User
router.get("/my-orders", authenticate, orderController.getMyOrders)
router.get("/:id", authenticate, orderController.getOrderById)
router.post("/", authenticate, orderController.createOrder)
router.put("/:id/cancel", authenticate, orderController.cancelOrder)

// authenticateed routes - Admin
router.get("/", authenticate, authorize("ADMIN"), orderController.getAllOrders)
router.put("/:id/status", authenticate, authorize("ADMIN"), orderController.updateOrderStatus)

export default router

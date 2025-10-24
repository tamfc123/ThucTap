import express from "express"
const router = express.Router()
import { authenticate, authorize } from "../middleware/auth.js"
import orderController from "../controllers/order.controllelr.js"

// authenticateed routes - User
router.get("/my-orders", orderController.getMyOrders)
router.get("/:id", authenticate, authorize("ADMIN"), orderController.getOrderById)
router.post("/", authenticate, authorize("ADMIN"),  orderController.createOrder)
router.put("/:id/cancel", authenticate, authorize("ADMIN"),  orderController.cancelOrder)

// authenticateed routes - Admin
router.get("/", authenticate, authorize("ADMIN"), orderController.getAllOrders)
router.put("/:id", authenticate, authorize("ADMIN"), orderController.updateOrderStatus)

export default router

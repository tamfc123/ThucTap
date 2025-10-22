import express from "express"
const router = express.Router()
import purchaseOrderController from "../controllers/purchase-oder.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", purchaseOrderController.getAll)
router.get("/:id", purchaseOrderController.getById)
router.post("/", purchaseOrderController.create)
router.put("/:id", purchaseOrderController.update)
router.delete("/:id", purchaseOrderController.deletePurchaseOrder)

export default router

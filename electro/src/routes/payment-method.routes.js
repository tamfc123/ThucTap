import express from "express"
const router = express.Router()
import  paymentMethodController from "../controllers/payment-method.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", paymentMethodController.getAll)
router.get("/:id", paymentMethodController.getById)
router.post("/", paymentMethodController.create)
router.put("/:id", paymentMethodController.update)
router.delete("/", paymentMethodController.deleteMany)

export default router

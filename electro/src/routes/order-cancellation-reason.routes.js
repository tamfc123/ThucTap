import express from "express"
const router = express.Router()
import orderCancellationReasonController from "../controllers/order-cancellation-reason.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", orderCancellationReasonController.getAll)
router.get("/:id", orderCancellationReasonController.getById)
router.post("/", orderCancellationReasonController.create)
router.put("/:id", orderCancellationReasonController.update)
router.delete("/", orderCancellationReasonController.deleteMany)

export default router

import express from "express"
const router = express.Router()
import  customerStatusController from "../controllers/customer-status.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", customerStatusController.getAll)
router.get("/:id", customerStatusController.getById)
router.post("/", customerStatusController.create)
router.put("/:id", customerStatusController.update)
router.delete("/", customerStatusController.deleteMany)

export default router

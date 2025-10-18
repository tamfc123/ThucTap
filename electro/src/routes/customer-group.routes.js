import express from "express"
const router = express.Router()
import  customerGroupController from "../controllers/customer-group.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", customerGroupController.getAll)
router.get("/:id", customerGroupController.getById)
router.post("/", customerGroupController.create)
router.put("/:id", customerGroupController.update)
router.delete("/", customerGroupController.deleteMany)

export default router

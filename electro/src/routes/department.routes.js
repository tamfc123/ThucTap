import express from "express"
const router = express.Router()
import departmentController from "../controllers/department.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", departmentController.getAll)
router.get("/:id", departmentController.getById)
router.post("/", departmentController.create)
router.put("/:id", departmentController.update)
router.delete("/", departmentController.deleteMany)

export default router

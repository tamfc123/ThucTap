import express from "express"
const router = express.Router()
import  employeeController from "../controllers/employee.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", employeeController.getAll)
router.get("/:id", employeeController.getById)
router.post("/", employeeController.create)
router.put("/:id", employeeController.update)
router.delete("/", employeeController.deleteMany)

export default router

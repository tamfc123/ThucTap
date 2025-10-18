import express from "express"
const router = express.Router()
import {officeController} from "../controllers/office.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", officeController.getAll)
router.get("/:id", officeController.getById)
router.post("/", officeController.create)
router.put("/:id", officeController.update)
router.delete("/", officeController.deleteMany)

export default router

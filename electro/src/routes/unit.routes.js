import express from "express"
const router = express.Router()
import  unitController from "../controllers/unit.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", unitController.getAll)
router.get("/:id", unitController.getById)
router.post("/", unitController.create)
router.put("/:id", unitController.update)
router.delete("/", unitController.deleteMany)

export default router

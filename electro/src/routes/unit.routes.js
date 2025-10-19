import express from "express"
const router = express.Router()
import unitController from "../controllers/unit.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.get("/", unitController.getAll)
router.get("/:id", unitController.getById)

router.post("/", authenticate, authorize("ADMIN"), unitController.create)
router.put("/:id", authenticate, authorize("ADMIN"), unitController.update)
router.delete("/:id", authenticate, authorize("ADMIN"), unitController.deleteUnit)

export default router

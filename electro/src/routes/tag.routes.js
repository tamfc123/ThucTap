import express from "express"
const router = express.Router()
import tagController from "../controllers/tag.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.get("/", tagController.getAll)
router.get("/:id", tagController.getById)

router.post("/", authenticate, authorize("ADMIN"), tagController.create)
router.put("/:id", authenticate, authorize("ADMIN"), tagController.update)
router.delete("/:id", authenticate, authorize("ADMIN"), tagController.deleteTag)

export default router

import express from "express"
const router = express.Router()
import specificationController from "../controllers/specification.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.get("/", specificationController.getAll)
router.get("/:id", specificationController.getById)

router.post("/", authenticate, authorize("ADMIN"), specificationController.create)
router.put("/:id", authenticate, authorize("ADMIN"), specificationController.update)
router.delete("/:id", authenticate, authorize("ADMIN"), specificationController.deleteSpecification)

export default router

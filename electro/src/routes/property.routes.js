import express from "express"
const router = express.Router()
import propertyController from "../controllers/property.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.get("/", propertyController.getAll)
router.get("/:id", propertyController.getById)

router.post("/", authenticate, authorize("ADMIN"), propertyController.create)
router.put("/:id", authenticate, authorize("ADMIN"), propertyController.update)
router.delete("/:id", authenticate, authorize("ADMIN"), propertyController.deleteProperty)

export default router

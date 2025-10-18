import express from "express"
const router = express.Router()
import  propertyController from "../controllers/property.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", propertyController.getAll)
router.get("/:id", propertyController.getById)
router.post("/", propertyController.create)
router.put("/:id", propertyController.update)
router.delete("/", propertyController.deleteMany)

export default router

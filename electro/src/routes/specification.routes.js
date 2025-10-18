import express from "express"
const router = express.Router()
import  specificationController from "../controllers/specification.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", specificationController.getAll)
router.get("/:id", specificationController.getById)
router.post("/", specificationController.create)
router.put("/:id", specificationController.update)
router.delete("/", specificationController.deleteMany)

export default router

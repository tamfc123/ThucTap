import express from "express"
const router = express.Router()
import  customerResourceController from "../controllers/customer-resource.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", customerResourceController.getAll)
router.get("/:id", customerResourceController.getById)
router.post("/", customerResourceController.create)
router.put("/:id", customerResourceController.update)
router.delete("/", customerResourceController.deleteMany)

export default router

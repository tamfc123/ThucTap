import express from "express"
const router = express.Router()
import  customerController from "../controllers/customer.controller.js"    
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", customerController.getAll)
router.get("/:id", customerController.getById)
router.post("/", customerController.create)
router.put("/:id", customerController.update)
router.delete("/", customerController.deleteMany)

export default router

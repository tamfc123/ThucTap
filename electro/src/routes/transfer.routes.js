import express from "express"
const router = express.Router()
import  transferController from "../controllers/transfer.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", transferController.getAll)
router.get("/:id", transferController.getById)
router.post("/", transferController.create)
router.put("/:id", transferController.update)
router.delete("/", transferController.deleteMany)

export default router

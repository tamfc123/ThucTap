import express from "express"
const router = express.Router()
import  tagController from "../controllers/tag.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", tagController.getAll)
router.get("/:id", tagController.getById)
router.post("/", tagController.create)
router.put("/:id", tagController.update)
router.delete("/", tagController.deleteMany)

export default router

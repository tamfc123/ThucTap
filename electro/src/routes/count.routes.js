import express from "express"
const router = express.Router()
import  countController from "../controllers/count.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", countController.getAll)
router.get("/:id", countController.getById)
router.post("/", countController.create)
router.put("/:id", countController.update)
router.delete("/", countController.deleteMany)

export default router

import express from "express"
const router = express.Router()
import  jobLevelController from "../controllers/job-level.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", jobLevelController.getAll)
router.get("/:id", jobLevelController.getById)
router.post("/", jobLevelController.create)
router.put("/:id", jobLevelController.update)
router.delete("/", jobLevelController.deleteMany)

export default router

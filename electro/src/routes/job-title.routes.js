import express from "express"
const router = express.Router()
import  jobTitleController from "../controllers/job-title.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", jobTitleController.getAll)
router.get("/:id", jobTitleController.getById)
router.post("/", jobTitleController.create)
router.put("/:id", jobTitleController.update)
router.delete("/", jobTitleController.deleteMany)

export default router

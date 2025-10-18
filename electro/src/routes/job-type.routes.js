import express from "express"
const router = express.Router()
import  jobTypeController from "../controllers/job-type.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", jobTypeController.getAll)
router.get("/:id", jobTypeController.getById)
router.post("/", jobTypeController.create)
router.put("/:id", jobTypeController.update)
router.delete("/", jobTypeController.deleteMany)

export default router

import express from "express"
const router = express.Router()
import  wardController from "../controllers/ward.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"


router.get("/", wardController.getAll)
router.get("/:id", wardController.getById)
router.use(authenticate)
router.post("/", authorize(["ADMIN"]), wardController.create)
router.put("/:id", authorize(["ADMIN"]), wardController.update)
router.delete("/", authorize(["ADMIN"]), wardController.deleteMany)

export default router

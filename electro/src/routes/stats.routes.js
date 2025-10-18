import express from "express"
const router = express.Router()
import  statsController from "../controllers/stats.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", statsController.getDashboardStats)

export default router

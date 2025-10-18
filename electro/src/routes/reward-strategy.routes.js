import express from "express"
const router = express.Router()
import  rewardStrategyController from "../controllers/reward-strategy.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", rewardStrategyController.getAll)
router.get("/:id", rewardStrategyController.getById)
router.post("/", rewardStrategyController.create)
router.put("/:id", rewardStrategyController.update)
router.delete("/", rewardStrategyController.deleteMany)

export default router

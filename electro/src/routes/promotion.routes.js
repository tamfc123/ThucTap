import express from "express"
const router = express.Router()
import  promotionController from "../controllers/promotion.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", promotionController.getAll)
router.get("/:id", promotionController.getById)
router.post("/", promotionController.create)
router.put("/:id", promotionController.update)
router.delete("/", promotionController.deleteMany)

export default router

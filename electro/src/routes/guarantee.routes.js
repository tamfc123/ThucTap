import express from "express"
const router = express.Router()
import  guaranteeController from "../controllers/guarantee.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", guaranteeController.getAll)
router.get("/:id", guaranteeController.getById)
router.post("/", guaranteeController.create)
router.put("/:id", guaranteeController.update)
router.delete("/", guaranteeController.deleteMany)

export default router

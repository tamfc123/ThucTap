import express from "express"
const router = express.Router()
import  waybillController from "../controllers/waybill.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", waybillController.getAll)
router.get("/:id", waybillController.getById)
router.post("/", waybillController.create)
router.put("/:id", waybillController.update)
router.delete("/", waybillController.deleteMany)

export default router

import express from "express"
const router = express.Router()
import  voucherController from "../controllers/voucher.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", voucherController.getAll)
router.get("/:id", voucherController.getById)
router.post("/", voucherController.create)
router.put("/:id", voucherController.update)
router.delete("/", voucherController.deleteMany)

export default router

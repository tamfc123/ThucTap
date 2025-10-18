import express from "express"
const router = express.Router()
import  docketReasonController from "../controllers/docket-reason.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", docketReasonController.getAll)
router.get("/:id", docketReasonController.getById)
router.post("/", docketReasonController.create)
router.put("/:id", docketReasonController.update)
router.delete("/", docketReasonController.deleteMany)

export default router

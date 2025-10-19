import express from "express"
const router = express.Router()
import guaranteeController from "../controllers/guarantee.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.get("/", guaranteeController.getAll)
router.get("/:id", guaranteeController.getById)

router.post("/", authenticate, authorize("ADMIN"), guaranteeController.create)
router.put("/:id", authenticate, authorize("ADMIN"), guaranteeController.update)
router.delete("/:id", authenticate, authorize("ADMIN"), guaranteeController.deleteGuarantee)

export default router

import express from "express"
const router = express.Router()
import  docketController from "../controllers/docket.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", docketController.getAll)
router.get("/:id", docketController.getById)
router.post("/", docketController.create)
router.put("/:id", docketController.update)
router.delete("/", docketController.deleteMany)

export default router

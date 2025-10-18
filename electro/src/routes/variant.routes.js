import express from "express"
const router = express.Router()
import  variantController from "../controllers/variant.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", variantController.getAll)
router.get("/:id", variantController.getById)
router.post("/", variantController.create)
router.put("/:id", variantController.update)
router.delete("/", variantController.deleteMany)

export default router

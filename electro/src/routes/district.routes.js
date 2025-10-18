import express from "express"
const router = express.Router()
import  districtController from "../controllers/district.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"


router.get("/", districtController.getAll)
router.get("/:id", districtController.getById)
router.use(authenticate)
router.post("/", authorize(["ADMIN"]), districtController.create)
router.put("/:id", authorize(["ADMIN"]), districtController.update)
router.delete("/", authorize(["ADMIN"]), districtController.deleteMany)

export default router

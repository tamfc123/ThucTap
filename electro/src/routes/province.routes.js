import express from "express"
import provinceController from "../controllers/province.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

const router = express.Router()

// Cho phép public GET
router.get("/", provinceController.getAll)
router.get("/:id", provinceController.getById)

// Các route còn lại cần ADMIN
router.use(authenticate)
router.post("/", authorize(["ADMIN"]), provinceController.create)
router.put("/:id", authorize(["ADMIN"]), provinceController.update)
router.delete("/", authorize(["ADMIN"]), provinceController.deleteMany)

export default router

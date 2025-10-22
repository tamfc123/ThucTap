import express from "express"
const router = express.Router()
import  warehouseController from "../controllers/warehouse.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", warehouseController.getAll)
router.get("/:id", warehouseController.getById)
router.post("/", warehouseController.create)
router.put("/:id", warehouseController.update)
router.delete("/", warehouseController.deleteMany)
router.delete("/:id", warehouseController.deleteById)   

export default router

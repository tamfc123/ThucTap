import express from "express"
const router = express.Router()
import supplierController from "../controllers/supplier.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.get("/", supplierController.getAll)
router.get("/:id", authenticate, supplierController.getById)

router.post("/", authenticate, authorize("ADMIN"), supplierController.create)
router.put("/:id", authenticate, authorize("ADMIN"), supplierController.update)
router.delete("/:id", authenticate, authorize("ADMIN"), supplierController.deleteSupplier)

export default router

import express from "express"
const router = express.Router()
import  inventoryController from "../controllers/inventory.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

// Product Inventory
router.get("/product-inventories", inventoryController.getAllProductInventories)
router.get("/product-inventories/:id", inventoryController.getProductInventoryById)

// Variant Inventory
router.get("/variant-inventories", inventoryController.getAllVariantInventories)
router.get("/variant-inventories/:id", inventoryController.getVariantInventoryById)

export default router

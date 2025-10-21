import express from "express"
const router = express.Router()
import destinationController from "../controllers/destination.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.get("/", authenticate, destinationController.getAll)
router.get("/:id", destinationController.getById)


router.post("/", authenticate, authorize("ADMIN"), destinationController.create)
router.put("/:id", authenticate, authorize("ADMIN"), destinationController.update)
router.delete("/:id", authenticate, authorize("ADMIN"), destinationController.deleteDestination)

export default router

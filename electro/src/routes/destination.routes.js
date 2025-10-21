import express from "express"
const router = express.Router()
import destinationController from "../controllers/destination.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", destinationController.getAll)
router.get("/:id", destinationController.getById)
router.post("/", destinationController.create)
router.put("/:id", destinationController.update)
router.delete("/:id", destinationController.deleteDestination)

export default router

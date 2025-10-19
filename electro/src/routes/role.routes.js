import express from "express"
const router = express.Router()
import roleController from "../controllers/role.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"


router.get("/", roleController.getAllRoles)
router.get("/:id", roleController.getRoleById)

router.post("/", authenticate, authorize("ADMIN"), roleController.createRole)
router.put("/:id", authenticate, authorize("ADMIN"), roleController.updateRole)
router.delete("/:id", authenticate, authorize("ADMIN"), roleController.deleteRole) // Nếu muốn xóa 1 role theo id
router.delete("/", authenticate, authorize("ADMIN"), roleController.deleteRoles)


export default router

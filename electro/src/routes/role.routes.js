import express from "express"
const router = express.Router()
import  roleController from "../controllers/role.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

router.use(authenticate)
router.use(authorize(["ADMIN"]))

router.get("/", roleController.getAllRoles)
router.get("/:id", roleController.getRoleById)
router.post("/", roleController.createRole)
router.put("/:id", roleController.updateRole)
router.delete("/:id", roleController.deleteRole) // Nếu muốn xóa 1 role theo id
router.delete("/", roleController.deleteRoles)


export default router

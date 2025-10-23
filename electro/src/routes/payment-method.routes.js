import express from "express"
const router = express.Router()
import  paymentMethodController from "../controllers/payment-method.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

// ========= CÁC ROUTE CÔNG KHAI (PUBLIC) =========
// Người dùng bình thường (ClientCart) cần gọi 2 route này
router.get("/", paymentMethodController.getAll)
router.get("/:id", paymentMethodController.getById)

// ========= CÁC ROUTE CỦA ADMIN =========
// Chỉ ADMIN mới có quyền tạo, sửa, xóa
router.post("/", authenticate, authorize(["ADMIN"]), paymentMethodController.create)
router.put("/:id", authenticate, authorize(["ADMIN"]), paymentMethodController.update)
router.delete("/", authenticate, authorize(["ADMIN"]), paymentMethodController.deleteMany)

export default router

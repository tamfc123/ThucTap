import express from "express";
import { handleMomoIPN } from "../controllers/payment.controller.js"; // 1. Import controller
// (Giả sử bạn đặt hàm handleMomoIPN trong file payment.controller.js)

const router = express.Router();

// 2. Đây chính là route cho webhook
// Momo sẽ gọi vào đường dẫn này bằng phương thức POST
router.post("/momo-ipn", handleMomoIPN);

// (Bạn cũng có thể thêm các route thanh toán khác ở đây, ví dụ: Paypal IPN)

export default router;
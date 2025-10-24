import Order from "../models/Order.js"; // Đảm bảo đường dẫn đúng
import crypto from "crypto";
// 1. IMPORT HÀM HELPER
import { restoreInventoryAndCancelOrder } from "../helpers/order.helper.js"; // <-- THÊM DÒNG NÀY

// POST /api/v1/payment/momo-ipn
export const handleMomoIPN = async (req, res) => {
  try {
    // 1. Lấy dữ liệu từ Momo IPN
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = req.body;

    // 2. Kiểm tra chữ ký (RẤT QUAN TRỌNG - Chống giả mạo)
    const secretKey = process.env.MOMO_SECRET_KEY;
    const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${process.env.APP_IPN_URL}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${process.env.APP_REDIRECT_URL}&requestId=${requestId}&requestType=payWithATM`;

    const expectedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Momo IPN: Sai chữ ký!");
      return res.status(400).json({ message: "Invalid signature" });
    }

    // 3. Xử lý kết quả thanh toán
    // Populate orderVariants để hàm restore có thể dùng
    const order = await Order.findOne({ code: orderId }).populate(
      "orderVariants"
    );
    if (!order) {
      console.error("Momo IPN: Không tìm thấy đơn hàng:", orderId);
      return res.status(404).json({ message: "Order not found" });
    }

    // Chỉ xử lý nếu đơn hàng đang "Chờ thanh toán"
    if (order.paymentStatus === 1) {
      if (resultCode === 0) {
        // THÀNH CÔNG
        order.paymentStatus = 2; // Ví dụ: 2 = Đã thanh toán
        order.status = 2; // Ví dụ: 2 = Đang xử lý (chờ giao hàng)
        order.momoTransId = transId; // Lưu lại mã giao dịch Momo
        await order.save();
        console.log(`Momo IPN: Đã xác nhận thanh toán cho đơn hàng ${orderId}`);

        // TODO: Gửi email, thông báo cho admin, v.v.
      } else {
        // THẤT BẠI (Người dùng hủy, hết thời gian, v.v.)
        console.log(
          `Momo IPN: Thanh toán thất bại cho đơn hàng ${orderId}, resultCode: ${resultCode}`
        );
        // Chạy logic hoàn kho và hủy đơn
        // 2. GỌI HÀM HELPER ĐÃ IMPORT
        await restoreInventoryAndCancelOrder(order);
      }
    } else {
      // Đơn hàng đã được xử lý trước đó (tránh IPN gọi nhiều lần)
      console.log(`Momo IPN: Đơn hàng ${orderId} đã được xử lý trước đó.`);
    }

    // 4. Phản hồi cho Momo
    res.status(204).send();
  } catch (error) {
    console.error("Lỗi xử lý Momo IPN:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

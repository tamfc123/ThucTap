import mongoose from "mongoose";
import Order from "../models/Order.js"; // Đảm bảo đường dẫn đúng
import Variant from "../models/Variant.js"; // Đảm bảo đường dẫn đúng

/**
 * HÀM HỖ TRỢ: Hủy đơn và hoàn kho
 * Dùng khi thanh toán Momo thất bại, hoặc IPN báo lỗi, hoặc Cron job
 */
export const restoreInventoryAndCancelOrder = async (order) => {
  // Đảm bảo "order" là một document Mongoose đầy đủ
  // Nếu chỉ truyền ID, bạn phải findOne nó trước
  if (!order || !order.orderVariants) {
     console.error("restoreInventoryAndCancelOrder: Dữ liệu order không hợp lệ.");
     return;
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // 1. Cập nhật trạng thái đơn hàng
    // Dùng findByIdAndUpdate để chắc chắn ta đang thao tác trên session
    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      {
        status: 5, // 5 = Đã hủy
        paymentStatus: 3, // 3 = Thanh toán thất bại
      },
      { session: session, new: true }
    );
    
    if (!updatedOrder) {
      throw new Error(`Không tìm thấy đơn hàng ${order.code} để hoàn kho.`);
    }

    // 2. Hoàn kho
    for (const item of updatedOrder.orderVariants) {
      const variant = await Variant.findById(item.variant).session(session);
      if (variant) {
        variant.inventory += item.quantity;
        await variant.save({ session });
      } else {
        // Ghi log cảnh báo nếu không tìm thấy variant
        console.warn(`Không tìm thấy variant ${item.variant} để hoàn kho.`);
      }
    }

    await session.commitTransaction();
    console.log(`Đã hủy và hoàn kho cho đơn hàng ${updatedOrder.code}`);
  } catch (error) {
    await session.abortTransaction();
    console.error(
      `Lỗi khi hoàn kho cho đơn hàng ${order.code}:`,
      error.message
    );
  } finally {
    session.endSession();
  }
};
import mongoose from "mongoose";

// Lấy enum từ frontend để dùng chung (nếu có thể)
// Hoặc định nghĩa lại ở đây
const RequiredNoteEnum = [
  'CHOTHUHANG',
  'CHOXEMHANGKHONGTHU',
  'KHONGCHOXEMHANG'
];

const waybillSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    order: { // Giữ tên 'order' để 'ref' hoạt động
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    
    // === CÁC TRƯỜNG MỚI THÊM TỪ FRONTEND ===
    shippingDate: {
      type: Date, // FE gửi string, Mongoose có thể parse
    },
    weight: {
      type: Number,
      required: true,
    },
    length: {
      type: Number,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    note: String, // Đã có, khớp với FE
    ghnRequiredNote: {
      type: String,
      enum: RequiredNoteEnum,
      required: true,
    },

    // === CÁC TRƯỜNG TỪ WaybillResponse (SERVER SẼ ĐIỀN) ===
    status: {
      type: Number, // Đổi sang Number để khớp WaybillResponse
      default: 1, // Ví dụ: 1 = PENDING (bạn cần định nghĩa)
    },
    expectedDeliveryTime: {
      type: Date,
    },
    codAmount: { // Tiền CoD (thu hộ)
      type: Number,
      default: 0,
    },
    shippingFee: { // Phí ship
      type: Number,
      default: 0,
    },
    ghnPaymentTypeId: { // ID phương thức thanh toán GHN
      type: Number,
    },
    
    // === CÁC TRƯỜNG CŨ (bạn có thể vẫn cần) ===
    shippingProvider: String, // Ví dụ: 'GHN'
    trackingNumber: String, // Mã theo dõi của GHN
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Waybill", waybillSchema);
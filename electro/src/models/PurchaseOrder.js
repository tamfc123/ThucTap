import mongoose from "mongoose";

const purchaseOrderSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    supplier: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    destination: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination", 
      required: true,
    },
    purchaseOrderVariants: [ 
      {
        variant: { 
          type: mongoose.Schema.Types.ObjectId,
          ref: "Variant",
          required: true, 
        },
        quantity: {
          type: Number,
          required: true, 
        },
        cost: { // Đã đổi tên từ price cho khớp (hoặc bạn đổi UI thành price)
          type: Number,
          required: true, 
        },
        _id: false 
      },
    ],
    totalAmount: {
      type: Number,
      default: 0,
      required: true, 
    },
    status: {
      type: Number,
      required: true, 
      default: 1, // Ví dụ: 1 = PENDING
    },
    note: {
      type: String,
      default: null, 
    },
    // dockets: [{ ... }] // <-- Đã xóa trường này
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("PurchaseOrder", purchaseOrderSchema);
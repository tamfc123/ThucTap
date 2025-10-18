import mongoose from "mongoose"

const waybillSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    shippingProvider: String,
    trackingNumber: String,
    status: {
      type: String,
      enum: ["PENDING", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "FAILED"],
      default: "PENDING",
    },
    note: String,
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Waybill", waybillSchema)

import mongoose from "mongoose"

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
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    items: [
      {
        variant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Variant",
        },
        quantity: Number,
        price: Number,
      },
    ],
    totalAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "RECEIVED", "CANCELLED"],
      default: "PENDING",
    },
    note: String,
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("PurchaseOrder", purchaseOrderSchema)

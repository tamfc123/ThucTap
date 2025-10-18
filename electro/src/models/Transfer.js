import mongoose from "mongoose"

const transferSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    fromWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    toWarehouse: {
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
      },
    ],
    status: {
      type: String,
      enum: ["PENDING", "IN_TRANSIT", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },
    note: String,
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Transfer", transferSchema)

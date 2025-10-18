import mongoose from "mongoose"

const docketSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    type: {
      type: String,
      enum: ["IN", "OUT"],
      required: true,
    },
    reason: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DocketReason",
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
      enum: ["PENDING", "APPROVED", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },
    note: String,
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Docket", docketSchema)

import mongoose from "mongoose"

const countSchema = new mongoose.Schema(
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
    items: [
      {
        variant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Variant",
        },
        systemQuantity: Number,
        actualQuantity: Number,
        difference: Number,
      },
    ],
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },
    note: String,
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Count", countSchema)

import mongoose from "mongoose"

const guaranteeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    months: {
      type: Number,
      default: 12,
    },
    status: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Guarantee", guaranteeSchema)

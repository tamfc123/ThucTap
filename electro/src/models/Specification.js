import mongoose from "mongoose"

const specificationSchema = new mongoose.Schema(
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
    status: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Specification", specificationSchema)

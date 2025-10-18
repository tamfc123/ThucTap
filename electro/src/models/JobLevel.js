import mongoose from "mongoose"

const jobLevelSchema = new mongoose.Schema(
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
    status: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("JobLevel", jobLevelSchema)

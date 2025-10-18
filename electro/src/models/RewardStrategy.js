import mongoose from "mongoose"

const rewardStrategySchema = new mongoose.Schema(
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
    pointsPerAmount: {
      type: Number,
      default: 1,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("RewardStrategy", rewardStrategySchema)

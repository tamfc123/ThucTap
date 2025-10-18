import mongoose from "mongoose"

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastMessage: String,
    lastMessageAt: Date,
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Room", roomSchema)

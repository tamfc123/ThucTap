import mongoose from "mongoose"

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

wishlistSchema.index({ user: 1, product: 1 }, { unique: true })

export default mongoose.model("Wishlist", wishlistSchema)

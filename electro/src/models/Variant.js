import mongoose from "mongoose"

const variantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    cost: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    properties: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: null,
    },
    images: [
      {
        id: Number,
        name: String,
        path: String,
        contentType: String,
        size: Number,
      },
    ],
    status: {
      type: Number,
      default: 1,
    },
    inventory: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

variantSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    return ret
  },
})

export default mongoose.model("Variant", variantSchema)

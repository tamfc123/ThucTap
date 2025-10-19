import mongoose from "mongoose"

const productSchema = new mongoose.Schema(
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
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    shortDescription: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    images: [
      {
        id: Number,
        name: String,
        path: String,
        contentType: String,
        size: Number,
        group: String,
        isThumbnail: Boolean,
        isEliminated: Boolean,
      },
    ],
    status: {
      type: Number,
      default: 1,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      default: null,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      default: null,
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      default: null,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    specifications: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: null,
    },
    properties: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: null,
    },
    variants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Variant",
      },
    ],
    weight: {
      type: Number,
      default: null,
    },
    guarantee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guarantee",
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Product", productSchema)

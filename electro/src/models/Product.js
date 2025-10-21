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
    },
    slug: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    // ... (shortDescription, description giữ nguyên)
    images: [
      {
        // id: Number, // <-- XÓA DÒNG NÀY
        name: String,
        path: String,
        contentType: String,
        size: Number,
        group: String,
        isThumbnail: Boolean,
        isEliminated: Boolean,
        // (Mongoose sẽ tự động thêm _id: ObjectId)
      },
    ],
    status: {
      type: Number,
      default: 1,
    },

    // =======================================================
    // SỬA LẠI TÊN CÁC TRƯỜNG CHO KHỚP VỚI FRONTEND
    // =======================================================
    categoryId: { // SỬA TÊN (từ 'category')
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    brandId: { // SỬA TÊN (từ 'brand')
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      default: null,
    },
    supplierId: { // SỬA TÊN (từ 'supplier')
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      default: null,
    },
    unitId: { // SỬA TÊN (từ 'unit')
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      default: null,
    },
    guaranteeId: { // SỬA TÊN (từ 'guarantee')
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guarantee",
      default: null,
    },
    // =======================================================

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
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Product", productSchema)
import mongoose from "mongoose"

const addressSchema = new mongoose.Schema(
  {
    line: {
      type: String,
      default: null,
    },
    province: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Province",
      default: null,
    },
    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
      default: null,
    },
    ward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ward",
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

addressSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    return ret
  },
})

export default mongoose.model("Address", addressSchema)

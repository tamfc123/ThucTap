import mongoose from "mongoose"

const verificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
     code: {
      type: Number,  // thêm field này
      required: false,
    },
    token: {
      type: String,
      required: true,
    },
    expiredAt: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["REGISTRATION", "PASSWORD_RESET"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

verificationSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    return ret
  },
})

export default mongoose.model("Verification", verificationSchema)

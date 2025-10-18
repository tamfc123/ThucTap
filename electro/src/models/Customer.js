import mongoose from "mongoose"

const customerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    customerGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomerGroup",
    },
    customerStatus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomerStatus",
    },
    customerResource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomerResource",
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

export default mongoose.model("Customer", customerSchema)

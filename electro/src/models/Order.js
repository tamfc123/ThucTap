import mongoose from "mongoose"

const orderSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: Number,
      default: 1,
    },
    toName: {
      type: String,
      required: true,
    },
    toPhone: {
      type: String,
      required: true,
    },
    toAddress: {
      type: String,
      required: true,
    },
    toWardName: {
      type: String,
      required: true,
    },
    toDistrictName: {
      type: String,
      required: true,
    },
    toProvinceName: {
      type: String,
      required: true,
    },
    orderResource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderResource",
      default: null,
    },
    orderCancellationReason: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderCancellationReason",
      default: null,
    },
    note: {
      type: String,
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderVariants: [
      {
        variant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Variant",
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    shippingCost: {
      type: Number,
      required: true,
    },
    totalPay: {
      type: Number,
      required: true,
    },
    paymentMethodType: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: Number,
      default: 1,
    },
    paypalOrderId: {
      type: String,
      default: null,
    },
    paypalOrderStatus: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

//orderSchema.set("toJSON", {
//   virtuals: true,
//   transform: (doc, ret) => {
//     ret.id = ret._id
//     delete ret._id
//     delete ret.__v
//     return ret
//   },
// })

export default mongoose.model("Order", orderSchema)

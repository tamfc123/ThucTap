import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema(
  {
    contactFullname: { type: String, default: null },
    contactEmail: { type: String, default: null },
    contactPhone: { type: String, default: null },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    status: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.model("Destination", destinationSchema);

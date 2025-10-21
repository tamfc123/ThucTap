import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema(
  {
    contactFullname: { type: String, default: null },
    contactEmail: { type: String, default: null },
    contactPhone: { type: String, default: null },
    address: {
          line: String,
          provinceId: { type: mongoose.Schema.Types.ObjectId, ref: "Province" },
          districtId: { type: mongoose.Schema.Types.ObjectId, ref: "District" },
          wardId: { type: mongoose.Schema.Types.ObjectId, ref: "Ward" },
        },
    status: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.model("Destination", destinationSchema);

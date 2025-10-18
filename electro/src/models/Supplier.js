import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
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
    email: String,
    phone: String,
    address: {
      line: { type: String },
      provinceId: { type: mongoose.Schema.Types.ObjectId, ref: "Province" },
      districtId: { type: mongoose.Schema.Types.ObjectId, ref: "District" },
      wardId: { type: mongoose.Schema.Types.ObjectId, ref: "Ward" },
    },
    contactPerson: String,
    status: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Supplier", supplierSchema);

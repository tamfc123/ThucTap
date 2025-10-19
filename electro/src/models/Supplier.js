import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    displayName: { type: String, required: true },
    companyName: { type: String },
    code: { type: String, required: true, unique: true },
    contactFullname: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    taxCode: { type: String },
    email: { type: String },
    phone: { type: String },
    fax: { type: String },
    website: { type: String },
    address: {
      line: String,
      provinceId: { type: mongoose.Schema.Types.ObjectId, ref: "Province" },
      districtId: { type: mongoose.Schema.Types.ObjectId, ref: "District" },
      wardId: { type: mongoose.Schema.Types.ObjectId, ref: "Ward" },
    },
    description: { type: String },
    note: { type: String },
    status: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.model("Supplier", supplierSchema);


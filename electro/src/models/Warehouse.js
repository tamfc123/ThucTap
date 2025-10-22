import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    address: {
      line: { type: String, default: null },
      provinceId: { type: mongoose.Schema.Types.ObjectId, ref: "Province", default: null },
      districtId: { type: mongoose.Schema.Types.ObjectId, ref: "District", default: null },
      wardId: { type: mongoose.Schema.Types.ObjectId, ref: "Ward", default: null },
    },
    status: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.model("Warehouse", warehouseSchema);

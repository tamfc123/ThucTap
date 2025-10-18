import mongoose from "mongoose"

const employeeSchema = new mongoose.Schema(
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
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    jobType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobType",
    },
    jobLevel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobLevel",
    },
    jobTitle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobTitle",
    },
    startDate: Date,
    endDate: Date,
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

export default mongoose.model("Employee", employeeSchema)

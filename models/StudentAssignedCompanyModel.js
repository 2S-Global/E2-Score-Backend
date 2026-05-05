import mongoose from "mongoose";

const SelectedStudentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstitueStudent",
      required: true,
    },
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // assuming institute is stored in User
      required: true,
    },
    requirementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyRequirement",
      required: true,
    },
    instituteCompanyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyByInstitute",
      required: true,
    },
    isPlacement: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("SelectedStudent", SelectedStudentSchema);
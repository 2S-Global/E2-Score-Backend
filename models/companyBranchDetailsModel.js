import mongoose from "mongoose";

const companyBranchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    branchName: {
      type: String,
      required: true,
      trim: true,
    },

    branchType: {
      type: String,
      required: true,
      trim: true,
    },

    number_of_employees: {
      type: Number,
      required: true,
    },

    is_del: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("CompanyBranchDetails", companyBranchSchema);
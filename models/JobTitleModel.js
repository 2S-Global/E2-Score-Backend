import mongoose from "mongoose";

const jobTitleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    isDel: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.JobTitle ||
  mongoose.model("JobTitle", jobTitleSchema);

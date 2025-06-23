import mongoose from "mongoose";

const resumeDetailsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
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

const ResumeDetails = mongoose.model("ResumeDetails", resumeDetailsSchema);
export default ResumeDetails;
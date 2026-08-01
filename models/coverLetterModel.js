import mongoose from "mongoose";

const coverLetterSchema = new mongoose.Schema(
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
  { timestamps: true },
);

const CoverLetter = mongoose.model("CoverLetter", coverLetterSchema);
export default CoverLetter;

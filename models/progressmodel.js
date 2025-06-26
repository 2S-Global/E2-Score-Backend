import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    section_name: {
      type: String,
      required: true,
    },
    progress_percentage: {
      type: Number,
    },
    isDel: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Progress = mongoose.model("profile_progresses", progressSchema);

export default Progress;

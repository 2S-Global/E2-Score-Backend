import mongoose from "mongoose";

const savedJobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobPostingList",
      required: true,
      index: true,
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

/* One job can be saved only once by a user */
savedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export default mongoose.model("SavedJob", savedJobSchema);

import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    institute_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    recruiter_id: {
      type: mongoose.Schema.Types.ObjectId,

    },
    star: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  },
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;

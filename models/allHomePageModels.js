import mongoose from "mongoose";

const bannerDetailsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    bannerImage: {
      type: String, // Cloudinary URL
      required: true,
    },
  },
  { timestamps: true }
);

const homeBannerDetails = mongoose.model("HomeBannerDetails", bannerDetailsSchema);

export default homeBannerDetails;
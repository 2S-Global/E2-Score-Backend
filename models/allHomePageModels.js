import mongoose from "mongoose";

const bannerDetailsSchema = new mongoose.Schema(
  {
    banner_title: {
      type: String,
      required: true,
      trim: true,
    },
    banner_image: {
      type: String, // Cloudinary URL
      required: true,
    },
    is_del: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

const homeBannerDetails = mongoose.model("HomeBannerDetails", bannerDetailsSchema);

export default homeBannerDetails;
import mongoose from "mongoose";

const ServiceDetailsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String, // store image URL or file path
      trim: true,
    },
    isDel: {
      type: Boolean,
      default: false, // soft delete flag
    },
  },
  { timestamps: true }
);

const ServiceDetails = mongoose.model("ServiceDetails", ServiceDetailsSchema);

export default ServiceDetails;
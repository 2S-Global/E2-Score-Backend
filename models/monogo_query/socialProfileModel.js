import mongoose from "mongoose";

const socialProfileSchema = new mongoose.Schema(
  {
    id: {
      type: Number
    },
    name: {
      type: String,
    },
    is_del: {
      type: Number,
      required: true
    },
    is_active: {
      type: Number,
      required: true
    },
  }
);

const list_social_profile = mongoose.model("list_social_profile", socialProfileSchema, "list_social_profile");

export default list_social_profile;
import mongoose from "mongoose";

const companySocialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    facebook: {
      type: String,
    },
    twitter: {
      type: String,
    },
    linkedin: {
      type: String,
    },
    instagram: {
      type: String,
    },
    youtube: {
      type: String,
    },
    telegram: {
      type: String,
    },
    discord: {
      type: String,
    },
    github: {
      type: String,
    },
  },
  { timestamps: true }
);

const CompanySocial = mongoose.model("CompanySocial", companySocialSchema);
export default CompanySocial;

import mongoose from "mongoose";

const candidateVerificationPriceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ["aadhar", "pan", "epic", "driving_license", "passport"],
    },
    price: {
      type: Number,
      required: true
    },
  },
  { timestamps: true }
);

const candidate_verification_price = mongoose.model(
  "candidate_verification_price",
  candidateVerificationPriceSchema
);

export default candidate_verification_price;
import mongoose from "mongoose";

const Schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // PAN
    pan_number: { type: String, index: true, sparse: true },
    pan_name: { type: String },
    pan_verified: { type: Boolean, default: false },

    // EPIC
    epic_number: { type: String, index: true, sparse: true },
    epic_name: { type: String },
    epic_verified: { type: Boolean, default: false },

    // Passport
    passport_number: { type: String, index: true, sparse: true },
    passport_name: { type: String },
    passport_dob: { type: Date },
    passport_verified: { type: Boolean, default: false },

    // Driving License
    dl_number: { type: String, index: true, sparse: true },
    dl_name: { type: String },
    dl_dob: { type: Date },
    dl_verified: { type: Boolean, default: false },

    // Aadhaar
    aadhar_number: { type: String, index: true, sparse: true },
    aadhar_verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const CandidateKYC = mongoose.model("CandidateKYC", Schema);
export default CandidateKYC;

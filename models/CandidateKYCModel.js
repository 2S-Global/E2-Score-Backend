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
    pan_response: { type: Object },

    // EPIC
    epic_number: { type: String, index: true, sparse: true },
    epic_name: { type: String },
    epic_verified: { type: Boolean, default: false },
    epic_response: { type: Object },

    // Passport
    passport_number: { type: String, index: true, sparse: true },
    passport_name: { type: String },
    passport_dob: { type: Date },
    passport_verified: { type: Boolean, default: false },
    passport_response: { type: Object },

    // Driving License
    dl_number: { type: String, index: true, sparse: true },
    dl_name: { type: String },
    dl_dob: { type: Date },
    dl_verified: { type: Boolean, default: false },
    dl_response: { type: Object },

    // Aadhaar
    aadhar_number: { type: String, index: true, sparse: true },
    aadhar_name: { type: String },
    aadhar_verified: { type: Boolean, default: false },
    aadhar_response: { type: Object },
  },
  { timestamps: true }
);

const CandidateKYC = mongoose.model("CandidateKYC", Schema);
export default CandidateKYC;

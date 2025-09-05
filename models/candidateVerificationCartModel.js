import mongoose from "mongoose";

const candidateVerificationCartSchema = new mongoose.Schema(
  {
    candidate_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // order_ref_id: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "allOrdersData",
    // },
    // plan: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Package",
    // },
    candidate_name: {
      type: String,
      required: true,
      trim: true,
    },
    verification_type: {
      type: String, // e.g. "pan", "aadhar", "passport", etc.
      required: true,
      lowercase: true,
    },
     fields: {
      type: Map,
      of: String, 
      // 👆 This makes schema flexible
      // Example for PAN: { number: "ABCDE1234F", name: "Chandra Sarkar" }
      // Example for Passport: { number: "K2456789", name: "Chandra Sarkar" }
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    // status: {
    //   type: String,
    //   enum: ["pending", "verified", "rejected"],
    //   default: "pending",
    // },
    // candidate_email: {
    //   type: String,
    // },
    // candidate_mobile: {
    //   type: String,
    // },
    // candidate_dob: {
    //   type: String,
    // },
    // candidate_address: {
    //   type: String,
    // },
    // candidate_gender: {
    //   type: String,
    // },
    // pan_name: {
    //   type: String,
    // },
    // pan_number: {
    //   type: String,
    // },
    // pan_image: {
    //   type: String,
    // },
    // pan_response: {
    //   type: Object,
    // },
    // aadhar_name: {
    //   type: String,
    // },
    // aadhar_number: {
    //   type: String,
    // },
    // aadhar_image: {
    //   type: String,
    // },
    // aadhaar_response: {
    //   type: Object,
    // },
    // dl_name: {
    //   type: String,
    // },
    // dl_number: {
    //   type: String,
    // },
    // dl_image: {
    //   type: String,
    // },
    // dl_response: {
    //   type: Object,
    // },
    // passport_name: {
    //   type: String,
    // },
    // passport_file_number: {
    //   type: String,
    // },
    // passport_image: {
    //   type: String,
    // },
    // passport_response: {
    //   type: Object,
    // },
    // epic_name: {
    //   type: String,
    // },
    // epic_number: {
    //   type: String,
    // },
    // epic_image: {
    //   type: String,
    // },
    // epic_response: {
    //   type: Object,
    // },
    // uan_name: {
    //   type: String,
    // },
    // uan_number: {
    //   type: String,
    // },
    // uan_image: {
    //   type: String,
    // },
    // uan_response: {
    //   type: Object,
    // },
    // epfo_name: {
    //   type: String,
    // },
    // epfo_number: {
    //   type: String,
    // },
    // epfo_response: {
    //   type: Object,
    // },
    // additionalfields: {
    //   type: String,
    // },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    is_paid: {
      type: Number,
      default: 0,
    },

    is_del: {
      type: Boolean,
      default: false,
    },
    all_verified: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const CandidateVerificationCart = mongoose.model(
  "CandidateVerificationCart",
  candidateVerificationCartSchema
);

export default CandidateVerificationCart;
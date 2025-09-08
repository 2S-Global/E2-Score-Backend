import mongoose from "mongoose";

const candidateVerificationSchema = new mongoose.Schema(
  {
    candidate_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order_ref_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "allOrdersData",
    },
    order_id: {
      type: String,
    },
    // plan: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Package",
    // },
    // owner_id: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "ownerdetails",
    // },
    // amount: {
    //   type: String,
    // },
    // pdf_url: {
    //   type: String,
    // },
    candidate_name: {
      type: String,
      required: false,
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
    response: {
      type: Object,
    },
    // candidate_email: {
    //   type: String,
    //   required: false,
    // },
    // candidate_mobile: {
    //   type: String,
    // },
    // candidate_dob: {
    //   type: String,
    //   required: true,
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
    // pan_response: {
    //   type: Object,
    // },
    // pan_image: {
    //   type: String,
    // },
    // aadhar_name: {
    //   type: String,
    // },
    // aadhar_number: {
    //   type: String,
    // },
    // aadhaar_response: {
    //   type: Object,
    // },
    // aadhar_image: {
    //   type: String,
    // },
    // dl_name: {
    //   type: String,
    // },
    // dl_number: {
    //   type: String,
    // },

    // dl_response: {
    //   type: Object,
    // },
    // dl_image: {
    //   type: String,
    // },
    // passport_name: {
    //   type: String,
    // },
    // passport_file_number: {
    //   type: String,
    // },
    // passport_response: {
    //   type: Object,
    // },
    // passport_image: {
    //   type: String,
    // },
    // epic_name: {
    //   type: String,
    // },
    // epic_number: {
    //   type: String,
    // },
    // epic_response: {
    //   type: Object,
    // },
    // epic_image: {
    //   type: String, 
    // },

    // uan_name: {
    //   type: String,
    // },
    // uan_number: {
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
    // aadhat_otp: {
    //   type: String,
    //   default: "no",
    // },
    updatedAt: {
      type: Date,
      default: Date.now,
    },

    is_del: {
      type: Boolean,
      default: false,
    },
    is_paid: {
      type: Number,
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

const CandidateVerification = mongoose.model(
  "CandidateVerificationOrder",
  candidateVerificationSchema
);

export default CandidateVerification;
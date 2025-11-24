import mongoose from "mongoose";

const Schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // PAN
    pan_number: { type: String, index: true, sparse: true },
    pan_name: { type: String },
    pan_verified: { type: Boolean, default: false },
    pan_response: { type: Object },

    //CIN
    cin_number: { type: String, index: true, sparse: true },
    cin_name: { type: String },
    cin_verified: { type: Boolean, default: false },
    cin_response: { type: Object },

    //GSTIN
    gstin_number: { type: String, index: true, sparse: true },
    gstin_name: { type: String },
    gstin_verified: { type: Boolean, default: false },
    gstin_response: { type: Object },
  },
  { timestamps: true }
);

const CompanyKYC = mongoose.model("CompanyKYC", Schema);
export default CompanyKYC;

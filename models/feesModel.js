import mongoose from "mongoose";

const Schema = new mongoose.Schema(
  {
    fees: {
      type: String,
    },
    pan_fees: {
      type: String,
    },
    epic_fees: {
      type: String,
    },
    passport_fees: {
      type: String,
    },
    dl_fees: {
      type: String,
    },
    aadhar_fees: {
      type: String,
    },  
    cibil_score: {
      type: String,
    },
    experian_score: {
      type: String,
    },
  },
  { timestamps: true }
);

const Fees = mongoose.model("Fee", Schema);
export default Fees;

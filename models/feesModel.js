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
  },
  { timestamps: true }
);

const Fees = mongoose.model("Fee", Schema);
export default Fees;

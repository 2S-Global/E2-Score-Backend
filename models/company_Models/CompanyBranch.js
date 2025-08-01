import mongoose from "mongoose";

const Schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "list_tbl_countries",
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "list_tbl_states",
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "list_tbl_cities",
    },

    name: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    is_del: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const CompanyBranch = mongoose.model("CompanyBranch", Schema);
export default CompanyBranch;

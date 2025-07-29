import mongoose from "mongoose";

const Schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companylist",
    },
    cin: {
      type: String,
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
    website: {
      type: String,
    },
    established: {
      type: Date,
    },
    team_size: {
      type: String,
    },
    industry_type: {
      type: String,
    },
    allowinsearch: {
      type: Boolean,
      default: true,
    },
    about: {
      type: String,
    },
    logo: {
      type: String,
    },
    cover: {
      type: String,
    },

    isDel: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
const CompanyDetails = mongoose.model("CompanyDetails", Schema);
export default CompanyDetails;

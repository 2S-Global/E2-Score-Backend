import mongoose from "mongoose";

const Schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company_type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "list_company_types",
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
    teamsize: {
      type: String,
    },
    industry_type: {
      type: String,
    },
    courses: [
      { type: mongoose.Schema.Types.ObjectId, ref: "list_university_course" },
    ],
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

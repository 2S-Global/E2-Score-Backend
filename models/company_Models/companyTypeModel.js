import mongoose from "mongoose";

const companyTypeSchema = new mongoose.Schema(
  {
    Type_ID: {
      type: Number,
      required: true,
      unique: true,
      index: true, // faster queries
    },

    Legal_Structure: {
      type: String,
      required: true,
      trim: true,
    },

    Taxation_Method: {
      type: String,
      required: true,
      trim: true,
    },

    Owner_Liability: {
      type: String,
      required: true,
      trim: true,
    },

    Has_CIN: {
      type: Boolean,
      default: false,
    },

    Description: {
      type: String,
      required: true,
      trim: true,
    },

    // Extra fields
    is_active: {
      type: Boolean,
      default: true,
    },

    is_del: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // auto createdAt & updatedAt
    versionKey: false, // removes __v
    collection: "list_company_types", // ensures correct collection name
  }
);

const CompanyType = mongoose.model("CompanyType", companyTypeSchema);
export default CompanyType;

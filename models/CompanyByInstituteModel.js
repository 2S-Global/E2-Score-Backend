import mongoose from "mongoose";

const CompanyByInstituteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    sector: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      // enum: ["Active", "Inactive", "Pending"],
      // default: "Active",
    },

    primaryContact: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email"],
    },

    phone: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, "Phone must be 10 digits"],
    },

    website: {
      type: String,
      trim: true,
    },

    initialOpenPositions: {
      type: Number,
      default: 0,
    },
    sectors: {
      type: [String],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
    },

    isDel: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const CompanyByInstitute = mongoose.model(
  "CompanyByInstitute",
  CompanyByInstituteSchema
);

export default CompanyByInstitute;
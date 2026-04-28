import mongoose from "mongoose";

const CompanyByInstituteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
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
    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, "Phone must be 10 digits"],
    },
    address: {
      type: String,
      required: true,
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

const CompanyByInstitute = mongoose.model("CompanyByInstitute", CompanyByInstituteSchema);

export default CompanyByInstitute;

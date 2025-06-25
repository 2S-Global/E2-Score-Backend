import mongoose from "mongoose";

const CompanyListSchema = new mongoose.Schema(
  {
    companyname: {
      type: String,
    },
    companyemail: {
      type: String,
    },
    companyaddress: {
      type: String,
    },
    companyphone: {
      type: String,
    },
    contactpersonname: {
      type: String,
    },
    contactpersoncontact: {
      type: String,
    },
    contactpersonemail: {
      type: String,
    },
    isDel: {
      type: Boolean,
      default: false,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true
    },
  },
  {
    timestamps: true,
  }
);

const companylist = mongoose.model(
  "companylists",
  CompanyListSchema
);

export default companylist;

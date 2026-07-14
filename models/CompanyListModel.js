import mongoose from "mongoose";

const CompanyListSchema = new mongoose.Schema(
  {
    cinnumber: {
      type: String,
    },
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
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    flag: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


CompanyListSchema.index({
  isActive: 1,
  isDel: 1,
  companyname: 1
})




const companylist = mongoose.model("companylists", CompanyListSchema);





export default companylist;
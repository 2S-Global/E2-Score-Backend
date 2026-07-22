import mongoose from "mongoose";
import slugify from 'slugify'
const CompanyListSchema = new mongoose.Schema(
  {
    cinnumber: {
      type: String,
    },
    companyname: {
      type: String,
    },
    slug: {
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
  },
);

CompanyListSchema.index({
  isActive: 1,
  isDel: 1,
  companyname: 1,
  slug: 1,
});




//default slug creation
CompanyListSchema.pre("save", function () {
  if (!this.isModified("companyname")) {
    return;
  }

  this.slug = slugify(this.companyname.trim(), {
    lower: true,
    strict: true,
    trim: true,
  });
});



const companylist = mongoose.model("companylists", CompanyListSchema);

export default companylist;

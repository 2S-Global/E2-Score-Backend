import mongoose from "mongoose";
import moreInformation from "../models/monogo_query/moreInformationModel.js"; // Assuming you have a MoreInformation model

const personalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assumes you have a User model
      required: true,
      index: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Transgender"],
    },
    dateofbirth: {
      type: Date,
    },
    residingInIndia: {
      type: Boolean,
    },
    country: {
      type: String,
    },
    location: {
      type: String,
    },
    hometown: {
      type: String,
    },
    resumeHeadline: {
      type: String,
    },
    resumeFileName: {
      type: String,
    },
    additionalInformation: {
      type: [String],
    },
    maritialStatus: {
      type: String,
    },
    partnerName: {
      type: String,
    },
    category: {
      type: String,
    },
    differentlyAble: {
      type: String,
    },
    disability_type: {
      type: String,
    },
    other_disability_type: {
      type: String,
    },
    workplace_assistance: {
      type: String,
    },

    careerBreak: {
      type: String,
    },

    currentlyOnCareerBreak: {
      type: Boolean,
      default: false,
    },
    startMonth: {
      type: String,
    },
    startYear: {
      type: String,
    },
    endMonth: {
      type: String,
    },
    endYear: {
      type: String,
    },
    reason: {
      type: String,
    },
    // usaPermit: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "WorkPermitUSA",
    // },
    usaPermit: {
      type: String,
    },
    // workPermitOther: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "WorkPermitOther",
    //   },
    // ],
    workPermitOther: {
      type: [String],
    },
    // workPermitOther: [Number],
    permanentAddress: {
      type: String,
    },
    pincode: {
      type: String,
    },

    isDel: {
      type: Boolean,
      default: false,
    },
    profileSummary: {
      type: String,
    },

    languageProficiency: [
      {
        language: {
          type: String,
        },
        proficiency: {
          type: String,
        },
        read: {
          type: Boolean,
          default: false,
        },
        write: {
          type: Boolean,
          default: false,
        },
        speak: {
          type: Boolean,
          default: false,
        },
      },
    ],
    /*   skills: [
      {
        type: String,
      },
    ], */
    skills: [
      {
        type: mongoose.Types.ObjectId,
        ref: "list_key_skill", // Assuming you have a model for key skills
      },
    ],
    have_usa_visa: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const personalDetails = mongoose.model("personalDetails", personalSchema);
export default personalDetails;

import mongoose from "mongoose";

const personalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assumes you have a User model
      required: true,
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
      type: [String],
    },
    category: {
      type: String,
    },
    differntllyAble: {
      type: Boolean,
    },
    careerBreak: {
      type: Boolean,
    },
    usaPermit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkPermitUSA",
    },
    workPermitOther: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WorkPermitOther",
      },
    ],
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
        skills: {
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
      },
    ],
    /*   skills: [
      {
        type: String,
      },
    ], */
    skills: {
      type: String,
    },
  },
  { timestamps: true }
);

const personalDetails = mongoose.model("personalDetails", personalSchema);
export default personalDetails;

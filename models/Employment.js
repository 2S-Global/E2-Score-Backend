import mongoose from "mongoose";

const employmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentEmployment: {
      type: Boolean,
      default:false
    },

    employmentType: {
      type: String,
    },

    totalExperience: {
      year: {
        type: Number,
        default: 0,
      },
      month: {
        type: Number,
        default: 0,
      },
    },

    companyName: {
      type: String,
    },

    jobTitle: {
      type: String,
    },

    joiningDate: {
      year: {
        type: Number,
        default: 0,
      },
      month: {
        type: Number,
        default: 0,
      }
    },
    leavingDate: {
      year: {
        type: Number,
        default: 0,
      },
      month: {
        type: Number,
        default: 0,
      },
    },

    jobDescription: {
      type: String,
    },

    isDel: {
      type: Boolean,
      default: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    jobTypeVerified: {
      type: Boolean,
      default: false,
    },
    jobDurationVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Employment = mongoose.model("Employment", employmentSchema);
export default Employment;

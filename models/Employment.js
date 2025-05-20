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
      type: Boolean,
    },

    totalExperience: {
      years: {
        type: Number,
        default: 0,
      },
      months: {
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
      type: Date,
    },
    leavingDate: {
      type: Date,
    },

    jobDescription: {
      type: String,
    },

    isDel: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Employment = mongoose.model("Employment", employmentSchema);
export default Employment;

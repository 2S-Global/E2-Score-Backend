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
      default: false
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

    NoticePeriod: {
      type: String
    },

    isDel: {
      type: Boolean,
      default: false,
    },
    workedInCompany: {
      type: Boolean,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    jobTypeVerified: {
      type: Boolean,
      default: false,
    },
    designationVerified: {
      type: Boolean,
      default: false,
    },
    jobDurationVerified: {
      type: Boolean,
      default: false,
    },
    servedNoticePeriod: {
      type: Boolean,
      default: false,
    },
    hasNOC: {
      type: Boolean,
      default: false,
    },
    hasDues: {
      type: Boolean,
      default: false,
    },
    remarks: {
      type: String,
    },
    isRejected: {
      type: Boolean,
    },
  },
  { timestamps: true }
);


employmentSchema.pre('save', function () {
  if (!this.isModified("jobTitle")) return;

  this.jobTitle = this.jobTitle.trim().toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
})

employmentSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate();

  if (update?.$set?.jobTitle) {
    update.$set.jobTitle = update.$set.jobTitle
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
});

const Employment = mongoose.model("Employment", employmentSchema);
export default Employment;
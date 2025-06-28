import mongoose from "mongoose";

const CareerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    CurrentIndustry: {
      type: String,
    },
    CurrentDepartment: {
      type: String,
    },

    JobRole: {
      type: String,
    },
    DesiredJob: {
      type: String,
    },
    DesiredEmployment: {
      type: String,
    },
    PreferredShift: {
      type: String,
    },
    location: {
      type: [String],
    },
    expectedSalary: {
      currency: {
        type: String,
      },
      salary: {
        type: Number,
      },
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

const UserCareer = mongoose.model("UserCareer", CareerSchema);

export default UserCareer;

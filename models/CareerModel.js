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
    location: {
      type: String,
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

const UserResearch = mongoose.model("UserCareer", CareerSchema);

export default UserResearch;

import mongoose from "mongoose";

const educationStandardSchema = new mongoose.Schema(
  {
   
    educationLevel: {
      type: String,
    },
   
    isDel: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const EducationStandard = mongoose.model("EducationStandard", educationStandardSchema);
export default EducationStandard;

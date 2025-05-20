import mongoose from "mongoose";

const mediumOfEducationSchema = new mongoose.Schema(
  {

    medium: {
      type: String,

    },

    isDel: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const MediumOfEducation = mongoose.model("MediumOfEducation", mediumOfEducationSchema);
export default MediumOfEducation;

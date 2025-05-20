import mongoose from "mongoose";

const userEducationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    level: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EducationStandard",
    },
    state: {
 type:String
    },

    year_of_passing: {
      type: String,
    },
    medium_of_education: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MediumOfEducation",
    },
    board: {
     type:String
    },
    transcript_data: {
      type: String, // Fixed typo
    },
    certificate_data: {
      type: String, // Fixed typo
    },
    marks: {
      type: String, // Ensure marks is stored properly
    },
    universityName: {
      type: String,
    },
    instituteName: {
      type: String,
    },
    courseName: {
      type: String,
    },
    specialization: {
      type: String,
    },
    courseType: {
      type: String,
    },
    duration: {
      from: {
        type: Number,
  
      },
      to: {
        type: Number,
    
      },
    },
    gradingSystem: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"UserGrading"
    },
    marks: {
      type: mongoose.Schema.Types.Mixed,
    },
    isPrimary: {
      type: Boolean,
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

const UserEducation = mongoose.model("UserEducation", userEducationSchema);

export default UserEducation;

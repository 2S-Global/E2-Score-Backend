import mongoose from "mongoose";

const userEducationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // level: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "EducationStandard",
    // },

    // Added Extra
    level: {
      type: String,
      required: true,
    },
    level_verified: {
      type: Boolean,
      default: false,
    },
    state: {
      type: String,
    },

    year_of_passing: {
      type: String,
    },
    // medium_of_education: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "MediumOfEducation",
    // },
    medium_of_education: {
      type: String,
    },
    board: {
      type: String,
    },
    school_name: {
      type: String,
    },
    transcript_data: {
      type: String,
    },
    certificate_data: {
      type: String,
    },
    marks: {
      type: String,
    },
    eng_marks: {
      type: String,
    },
    math_marks: {
      type: String,
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
    duration_verified: {
      type: Boolean,
      default: false,
    },
    // gradingSystem: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref:"UserGrading"
    // },
    gradingSystem: {
      type: String,
    },
    marks: {
      type: mongoose.Schema.Types.Mixed,
    },
    marks_verified: {
      type: Boolean,
      default: false,
    },
    isPrimary: {
      type: Boolean,
    },

    isDel: {
      type: Boolean,
      default: false,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const usereducation = mongoose.model("usereducation", userEducationSchema);

export default usereducation;

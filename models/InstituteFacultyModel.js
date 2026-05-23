import mongoose from "mongoose";

const InstituteFacultySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    full_name: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    phone_number: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, "Phone must be 10 digits"],
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email"],
    },

    student_count: {
      type: Number,
      default: 0,
    },

    course_count: {
      type: Number,
      default: 0,
    },

    about: {
      type: String,
      trim: true,
    },

    area_of_experties: {
      type: [String],
      trim: true,
    },

    recognitions: {
      type: String,
      trim: true,
    },

    courses_name: {
      type: [String],
    },

    office_hours: {
      type: String
    },

    address: {
      type: String
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

const InstituteFaculty = mongoose.model(
  "InstituteFaculty",
  InstituteFacultySchema
);

export default InstituteFaculty;
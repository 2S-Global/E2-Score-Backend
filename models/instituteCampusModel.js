import mongoose from "mongoose";

const campusSchema = new mongoose.Schema(
  {
    campus_name: {
      type: String,
      trim: true,
    },
    campus_type: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    total_students: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("instituteCampus", campusSchema);

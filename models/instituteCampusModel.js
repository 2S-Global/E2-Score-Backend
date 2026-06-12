import mongoose from "mongoose";

const campusSchema = new mongoose.Schema(
  {
     
    institute_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
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

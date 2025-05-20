import mongoose from "mongoose";

const skillsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skillName: {
      type: String,
    },
    softwareVersion: {
      type: String,
    },
    lastUsed: {
      type: Name,
    },
    experience: {
      year: {
        type: Number,
      },
      month: {
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

const UserSkill = mongoose.model("UserSkill", skillsSchema);

export default UserSkill;

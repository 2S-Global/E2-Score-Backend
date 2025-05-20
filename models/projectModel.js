import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectTitle: {
      type: String,
    },
    taggedWith: {
      type: String,
    },

    clientName: {
      type: String,
    },

    projectStatus: {
      type: String,
    },
    workedFrom: {
      year: {
        type: Number,
      },
      month: {
        type: Number,
      },
    },
    workedTill: {
      year: {
        type: Number,
      },
      month: {
        type: Number,
      },
    },
    description: {
      type: String,
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

const UserProject = mongoose.model("UserProject", projectSchema);

export default UserProject;


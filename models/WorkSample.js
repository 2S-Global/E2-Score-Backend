import mongoose from "mongoose";

const WorkSampleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workTitle: {
      type: String,
    },
    url: {
      type: String,
    },

    durationFrom: {
      year: {
        type: Number,
      },
      month: {
        type: Number,
      },
    },
    durationTo: {
      year: {
        type: Number,
      },
      month: {
        type: Number,
      },
    },
    currentlyWorking: {
      type: Boolean,
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

const WorkSample = mongoose.model("WorkSample", WorkSampleSchema);

export default WorkSample;

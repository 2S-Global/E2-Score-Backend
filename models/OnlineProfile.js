import mongoose from "mongoose";

const onlineProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    socialProfile: {
      type: String,
    },
    url: {
      type: String,
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

const OnlineProfile = mongoose.model("OnlineProfile", onlineProfileSchema);

export default OnlineProfile;

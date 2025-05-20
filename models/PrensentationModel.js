import mongoose from "mongoose";

const presentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
    },
    url: {
      type: String,
    },

    publishedOn: {
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

const UserResearch = mongoose.model("UserPresentation", presentSchema);

export default UserResearch;

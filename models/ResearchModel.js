import mongoose from "mongoose";

const ResearchSchema = new mongoose.Schema(
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



ResearchSchema.pre('save', function () {
  if (!this.isModified("title")) return;
  this.title = this.title
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");


})

const UserResearch = mongoose.model("UserResearch", ResearchSchema);

export default UserResearch;

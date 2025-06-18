import mongoose from "mongoose";

const itskillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skillSearch: {
      type: String,
    },
    version: {
      type: String,
    },
    lastUsed: {
      type: String,
    },
    experienceyear: {
      type: String,
    },
    experiencemonth: {
      type: String,
    },
    is_del: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Itskill = mongoose.model("Itskill", itskillSchema);
export default Itskill;

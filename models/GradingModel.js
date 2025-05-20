import mongoose from "mongoose";

const GradingSchema = new mongoose.Schema(
  {
    name: {
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

const UserGrading = mongoose.model("UserGrading", GradingSchema);

export default UserGrading;

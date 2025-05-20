import mongoose from "mongoose";

const workPermitSchema = new mongoose.Schema(
  {
    permitType: {
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

const WorkPermitUSA = mongoose.model("WorkPermitUSA", workPermitSchema);
export default WorkPermitUSA;

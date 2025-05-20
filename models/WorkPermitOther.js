import mongoose from "mongoose";

const workPermitOtherSchema = new mongoose.Schema(
  {

    country: {
      type: String,
     
    },
    
  },
  {
    timestamps: true,
  }
);

const WorkPermitOther = mongoose.model("WorkPermitOther", workPermitOtherSchema);
export default WorkPermitOther;

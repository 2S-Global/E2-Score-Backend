import mongoose from "mongoose";

const DisabilityTypeSchema = new mongoose.Schema(
  {
    id: {
      type: Number
    },
    name: {
      type: String,
    },
    is_del: {
      type: Number,
      required: true
    },
    is_active: {
      type: Number,
      required: true
    },
  }
);

const list_disability_type = mongoose.model("list_disability_type", DisabilityTypeSchema, "list_disability_type");

export default list_disability_type;

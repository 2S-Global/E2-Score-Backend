import mongoose from "mongoose";

const maritalStatusSchema = new mongoose.Schema(
  {
    id: {
      type: Number
    },
    status: {
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

const list_marital_status = mongoose.model("list_marital_status", maritalStatusSchema, "list_marital_status");

export default list_marital_status;
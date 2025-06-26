import mongoose from "mongoose";

const breakReasonSchema = new mongoose.Schema(
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

const list_career_break_reason = mongoose.model("list_career_break_reason", breakReasonSchema, "list_career_break_reason");

export default list_career_break_reason;
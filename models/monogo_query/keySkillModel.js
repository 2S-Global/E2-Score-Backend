import mongoose from "mongoose";

const GenderSchema = new mongoose.Schema(
  {
    id: {
      type: Number
    },
    Skill: {
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

const list_gender = mongoose.model("list_gender", GenderSchema, "list_gender");

export default list_gender;

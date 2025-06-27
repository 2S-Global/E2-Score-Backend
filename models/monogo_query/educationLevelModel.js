import mongoose from "mongoose";

const educationLevelSchema = new mongoose.Schema(
  {
    id: {
      type: Number
    },
    level: {
      type: String,
    },
    duration: {
      type: Number,
    },
    type: {
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

const list_education_level = mongoose.model("list_education_level", educationLevelSchema, "list_education_level");

export default list_education_level;
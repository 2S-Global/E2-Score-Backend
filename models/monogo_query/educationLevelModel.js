import mongoose from "mongoose";

const educationLevelSchema = new mongoose.Schema({
  id: {
    type: Number,
    index: true,
  },
  level: {
    type: String,
    index: true,
  },
  duration: {
    type: Number,
  },
  type: {
    type: String,
  },
  is_del: {
    type: Number,
    required: true,
  },
  is_active: {
    type: Number,
    required: true,
  },
});

//index
educationLevelSchema.index({ level: 1, is_del: 1 });

educationLevelSchema.index({ id: 1, is_del: 1 });

educationLevelSchema.index({ id: 1 });

const list_education_level = mongoose.model(
  "list_education_level",
  educationLevelSchema,
  "list_education_level"
);

export default list_education_level;

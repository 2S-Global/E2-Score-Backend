import mongoose from "mongoose";

const GenderSchema = new mongoose.Schema({
  id: {
    type: Number,
    index: true,
  },
  name: {
    type: String,
    index: true,
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
GenderSchema.index({ name: 1, is_del: 1 });

GenderSchema.index({ id: 1, is_del: 1 });

const list_gender = mongoose.model("list_gender", GenderSchema, "list_gender");

export default list_gender;

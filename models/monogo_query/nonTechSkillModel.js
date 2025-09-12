import mongoose from "mongoose";

const Schema = new mongoose.Schema({
  name: {
    type: String,
  },
  label: {
    type: String,
  },
  is_del: {
    type: Number,
    required: true,
    default: 0,
  },
  is_active: {
    type: Number,
    required: true,
    default: 1,
  },
  flag: {
    type: Number,
    required: true,
    default: 0,
  },
});

const list_non_tech_skill = mongoose.model("list_non_it_skills", Schema);

export default list_non_tech_skill;
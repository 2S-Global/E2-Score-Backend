import mongoose from "mongoose";

const Schema = new mongoose.Schema({
  id: {
    type: Number,
  },
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

const list_tech_skill = mongoose.model("list_tech_skill", Schema);

export default list_tech_skill;

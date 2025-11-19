import mongoose from "mongoose";

const KeySkillSchema = new mongoose.Schema({
  id: {
    type: Number,
    index: true,
  },
  Skill: {
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

const list_key_skill = mongoose.model("list_key_skill", KeySkillSchema);

export default list_key_skill;

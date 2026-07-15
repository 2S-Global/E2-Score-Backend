import mongoose from "mongoose";

const KeySkillSchema = new mongoose.Schema({
  id: {
    type: Number,
    index: true,
    unique: true,
  },
  Skill: {
    type: String,
    required: true,
    trim: true,
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

KeySkillSchema.index({
  is_del: 1,
  is_active: 1,
  Skill: 1,
});

const list_key_skill = mongoose.model("list_key_skill", KeySkillSchema);

export default list_key_skill;

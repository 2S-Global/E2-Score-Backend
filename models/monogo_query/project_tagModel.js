import mongoose from "mongoose";

const Schema = new mongoose.Schema({
  id: {
    type: Number,
  },
  name: {
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

const list_project_tag = mongoose.model("list_project_tag", Schema);

export default list_project_tag;

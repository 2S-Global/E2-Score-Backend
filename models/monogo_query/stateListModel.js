import mongoose from "mongoose";

const stateListSchema = new mongoose.Schema(
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

const list_state = mongoose.model("list_state", stateListSchema);

export default list_state;
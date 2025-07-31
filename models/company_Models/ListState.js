import mongoose from "mongoose";

const Schema = new mongoose.Schema(
  {
    id: {
      type: Number,
    },
    name: {
      type: String,
    },
    stateCode: {
      type: String,
    },
    countryId: {
      type: Number,
    },
    is_del: {
      type: Number,
      default: 0,
    },
    is_active: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const ListState = mongoose.model("list_tbl_states", Schema);
export default ListState;

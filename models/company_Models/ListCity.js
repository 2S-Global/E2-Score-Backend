import mongoose from "mongoose";

const Schema = new mongoose.Schema(
  {
    id: {
      type: Number,
    },
    name: {
      type: String,
    },

    stateId: {
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

const ListCity = mongoose.model("list_tbl_cities", Schema);
export default ListCity;

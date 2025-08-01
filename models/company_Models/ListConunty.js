import mongoose from "mongoose";

const Schema = new mongoose.Schema(
  {
    id: {
      type: Number,
    },
    name: {
      type: String,
    },
    phoneCode: {
      type: Number,
    },
    native: {
      type: String,
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

const ListConunty = mongoose.model("list_tbl_countries", Schema);
export default ListConunty;

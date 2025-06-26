import mongoose from "mongoose";

const CountriesSchema = new mongoose.Schema(
  {
    id: {
      type: Number
    },
    name: {
      type: String,
    },
    phoneCode: {
      type: String,
    },
    native: {
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

const list_tbl_countrie = mongoose.model("list_tbl_countrie", CountriesSchema);

export default list_tbl_countrie;

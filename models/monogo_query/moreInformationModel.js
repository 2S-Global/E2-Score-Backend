import mongoose from "mongoose";

const MoreInformationSchema = new mongoose.Schema(
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

const list_more_information = mongoose.model("list_more_information", MoreInformationSchema, "list_more_information");

export default list_more_information;
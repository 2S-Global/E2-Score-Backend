import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
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

const list_notice = mongoose.model("list_notice_periods", noticeSchema);

export default list_notice;

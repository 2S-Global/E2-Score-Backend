import mongoose from "mongoose";

const ListVerificationListSchema = new mongoose.Schema(
  {
    verification_name: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    fields: {
      type: [String],
      required: true,
    },
    isDel: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  }
);

const ListVerificationList = mongoose.model(
  "list_verification_list",
  ListVerificationListSchema
);

export default ListVerificationList;

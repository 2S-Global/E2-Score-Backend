import mongoose from "mongoose";

const PatentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
    },
    /* added on 13/06/2025 */
    url: {
      type: String,
    },
    patent_office: {
      type: String,
    },
    status: {
      type: String,
    },
    application_number: {
      type: String,
    },
    issue_year: {
      type: String,
    },
    issue_month: {
      type: String,
    },
    // end of 13/06/2025
    description: {
      type: String,
    },
    isDel: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const UserPatent = mongoose.model("UserPatent", PatentSchema);

export default UserPatent;

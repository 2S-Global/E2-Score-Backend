import mongoose from "mongoose";

const Schema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobPosting",
      required: true,
    },
    jobTitle: {
      type: String,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderEmail: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    is_del: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Sent", "Accepted", "Rejected"],
      default: "Sent",
    },
  },
  {
    timestamps: true,
  },
);

Schema.index({
  employerId: 1,
  is_del: 1,
  status: 1,
});

Schema.index({
  employerId: 1,
  is_del: 1,
  jobTitle: 1,
});

const JobInvitations = mongoose.model("JobInvitations", Schema);
export default JobInvitations;

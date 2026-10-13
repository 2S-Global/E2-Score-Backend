import mongoose from "mongoose";

const jobInvitationHandoffSchema = new mongoose.Schema(
  {
    ticketHash: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

jobInvitationHandoffSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const JobInvitationHandoff = mongoose.model(
  "JobInvitationHandoff",
  jobInvitationHandoffSchema,
);

export default JobInvitationHandoff;

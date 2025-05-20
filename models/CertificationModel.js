import mongoose from "mongoose";

const CertificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    certificationName: {
      type: String,
    },
    certificationId: {
      type: String,
    },
    url: {
      type: String,
    },

    validityFrom: {
      year: {
        type: Number,
      },
      month: {
        type: Number,
      },
    },
   validityTo: {
      year: {
        type: Number,
      },
      month: {
        type: Number,
      },
    },
    expired: {
      type: Boolean,
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

const UserCertification = mongoose.model("UserCertification", CertificationSchema);

export default UserCertification;

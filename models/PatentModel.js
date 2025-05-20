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

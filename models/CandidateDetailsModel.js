import mongoose from "mongoose";

const candidateDetailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  dob: {
    type: Date,
  },
  country_id: {
    type: String,
  },
  currentLocation: {
    type: String,
  },
  hometown: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const CandidateDetails = mongoose.model(
  "CandidateDetails",
  candidateDetailsSchema
);
export default CandidateDetails;

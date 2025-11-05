import mongoose from "mongoose";
//try
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
  fatherName: {
    type: String,
  },
  currentSalary: {
    currency: {
      type: String,
    },
    salary: {
      type: Number,
    },
  },
  totalExperience: {
    year: {
      type: String,
    },
    month: {
      type: String,
    },
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

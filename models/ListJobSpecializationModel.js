import mongoose from "mongoose";

const JobSpecializationSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  label: {
    type: String,
  },
  isDel: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
  isFlag: {
    type: Boolean,
    required: false,
  },
});

const list_job_specialization = mongoose.model(
  "list_job_specialization",
  JobSpecializationSchema
);

export default list_job_specialization;

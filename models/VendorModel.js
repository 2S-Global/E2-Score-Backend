import mongoose from "mongoose";

const VendorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone_number: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    contact_person_name: { type: String, required: true, trim: true },
    contact_person_email: { type: String, required: true, trim: true },
    contact_person_phone_number: { type: String, required: true, trim: true },
    contact_person_designation: { type: String, required: true, trim: true },

    is_del: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const VendorDetails = mongoose.model("vendordetails", VendorSchema);

const VendorSubmitRequestSchema = new mongoose.Schema(
  {
    VendorDetailsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vendordetails",
      required: true,
    },
    VendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobPostingList",
      required: true,
    },
    requestId: { type: String, required: true, trim: true },
    jobTitle: { type: String, required: true, trim: true },
    candidateCount: { type: Number, required: true, trim: true },
    sharedCandidate: { type: Number, trim: true, default: 0 },
    sharedCandidateDate: { type: Date, default: null },
    sharedCandidateHistory: [{ type: Date }],
    vendorName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    contact_person_name: { type: String, required: true, trim: true },
    contact_person_email: { type: String, required: true, trim: true },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyBranch",
    },

    is_del: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const VendorSubmitRequest = mongoose.model(
  "VendorSubmitRequest",
  VendorSubmitRequestSchema,
);

const VendorCandidateSchema = new mongoose.Schema(
  {
    VendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    CandidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone_number: { type: String, required: true, trim: true },
    cv: { type: String, required: true, trim: true },
    cvPublicId: { type: String, trim: true },
    role: { type: Number, default: 1 },
    is_del: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const VendorCandidates = mongoose.model(
  "VendorCandidates",
  VendorCandidateSchema,
);

const VendorSendCandidateSchema = new mongoose.Schema(
  {
    VendorSubmitRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VendorSubmitRequest",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobPostingList",
      required: true,
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    VendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    CandidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isSelected: { type: Boolean, default: false },
    selectedDate: { type: Date, default: null },
    is_del: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
  },
  { timestamps: true },
);

VendorSendCandidateSchema.index(
  { VendorId: 1, jobId: 1, CandidateId: 1 },
  { unique: true },
);

export const VendorSendCandidate = mongoose.model(
  "VendorSendCandidate",
  VendorSendCandidateSchema,
);

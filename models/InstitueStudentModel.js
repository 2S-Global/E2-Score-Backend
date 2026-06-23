import mongoose from "mongoose";

const InstitueStudentSchema = new mongoose.Schema({
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  userCreatedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: { type: String, required: true, trim: true },
  USN: { type: String,  trim: true },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "student_course_details",
    required: true
  },
  gender: { type: String, required: true, trim: true },
  dob: { type: Date, trim: true },
  admissionYear: { type: String, required: true, trim: true },
  presentYear: { type: String, required: true, trim: true },
  semester: { type: Number, trim: true },
  tenTh: { type: Number },
  twelveTh: { type: Number },
  graduationMarks: { type: Number },
  promotedYear: { type: String, default: null },
  promotedSemester: { type: Number, default: null },
  attendInterview: { type: Number, default: 0 },
  placement: { type: Number, default: 0 },
  placementReadySemester: { type: Number, default: 0 },
  promotedDate: { type: Date, default: null },
  email: { type: String },
  phoneNumber: { type: String },
  is_del: { type: Boolean, default: false },
  status: { type: Boolean, default: true },
  isSelfRegistered: { type: String, default: 'no' },
  endYear: { type: String, default: null },
},
  { timestamps: true }
);

export const InstitueStudent = mongoose.model("InstitueStudent", InstitueStudentSchema);

const InstitueStudentSemesterSchema = new mongoose.Schema({
  InstitueStudentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstitueStudent",
    required: true
  },
  semester: { type: Number, required: true, trim: true },
  marks: { type: Number, required: true, trim: true },
  grades: { type: String, trim: true },
  is_del: { type: Boolean, default: false },
},
  { timestamps: true }
);

export const InstitueStudentSemester = mongoose.model("InstitueStudentSemester", InstitueStudentSemesterSchema);



const StudentPlacementSchema = new mongoose.Schema({
   instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  sudentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  studentName: { type: String, trim: true },
  studentEmail: { type: String, trim: true },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "companybyinstitutes",
    required: true
  },
   recruiterName: { type: String, trim: true },
   recruiterEmail: { type: String, trim: true },
    companyRequirementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CompanyRequirement",
    required: true
  },
   
   institueStudentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "instituestudents",
    required: true
  },
  placement: { type: Number, default:0 },
  role: { type: String, trim: true },
  date: { type: Date},
  time: { type: String, trim: true },
  tenTh: { type: String, trim: true },
  twelveTh: { type: String, trim: true },
  course: { type: String, trim: true },
  studentPhone: { type: String, trim: true },
  is_del: { type: Boolean, default: false },
},
  { timestamps: true }
);

export const StudentPlacement = mongoose.model("StudentPlacement", StudentPlacementSchema);





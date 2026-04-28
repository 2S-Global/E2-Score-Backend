import mongoose from "mongoose";

const InstitueStudentSchema = new mongoose.Schema({
  instituteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required:true
          },
  name: { type: String,required:true,trim:true },
  USN : { type: String,required:true,trim:true },
  program :{
        type: mongoose.Schema.Types.ObjectId,
        ref: "student_course_details", 
        required:true
          },
  gender: { type: String ,required:true,trim:true},
  dob: { type: Date ,required:true,trim:true},
  admissionYear: { type: String ,required:true,trim:true},
  presentYear: { type: String ,required:true,trim:true},
  semester: { type: Number,required:true,trim:true },
  tenTh: { type: Number, required:true },
  twelveTh: { type: Number, required:true },
  graduationMarks: { type: Number, required:true },
  promotedYear: { type: String, default:null },
  promotedSemester: { type: Number, default:null},
  attendInterview: { type: Number, default:0},
  placement: { type: Number, default:0},
  promotedDate: { type: Date, default:null },
  is_del: { type: Boolean, default: false },
  status: { type: Boolean, default: true }
},
{timestamps:true}
);

export const InstitueStudent = mongoose.model("InstitueStudent", InstitueStudentSchema);

const InstitueStudentSemesterSchema = new mongoose.Schema({
  InstitueStudentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InstitueStudent", 
        required:true
          },
  semester: { type: Number,required:true,trim:true },
  marks : { type: Number,required:true,trim:true },
  grades : { type: String,trim:true },
  is_del: { type: Boolean, default: false },
},
{timestamps:true}
);

export const InstitueStudentSemester = mongoose.model("InstitueStudentSemester", InstitueStudentSemesterSchema);




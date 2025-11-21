import usereducation from "../../models/userEducationModel.js";
import CompanyDetails from "../../models/company_Models/companydetails.js";
import list_university_colleges from "../../models/monogo_query/universityCollegesModel.js";
import list_university_course from "../../models/monogo_query/universityCourseModel.js";
import User from "../../models/userModel.js";
import CandidateDetails from "../../models/CandidateDetailsModel.js";
import personalDetails from "../../models/personalDetails.js";
import list_gender from "../../models/monogo_query/genderModel.js";
import CandidateKYC from "../../models/CandidateKYCModel.js";
import list_education_level from "../../models/monogo_query/educationLevelModel.js";
import list_course_type from "../../models/monogo_query/courseTypeModel.js";
import list_grading_system from "../../models/monogo_query/gradingSystemModel.js";

import nodemailer from "nodemailer";

export const GetunverifiedStudents = async (req, res) => {
  try {
    const userId = req.userId;

    // ✅ Step 1: Verify institute linked to user
    const instituteDetails = await CompanyDetails.findOne({
      userId,
      isDel: false,
    });

    if (!instituteDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Institute not found." });
    }

    // ✅ Step 2: Fetch all matching institutes
    const listOfInstitutes = await list_university_colleges.find({
      name: instituteDetails.name,
      is_del: 0,
    });

    if (!listOfInstitutes?.length) {
      return res
        .status(404)
        .json({ success: false, message: "No institutes found." });
    }

    // ✅ Step 3: Extract institute IDs
    const instituteIds = listOfInstitutes.map((inst) => inst.id.toString());

    // ✅ Step 4: Query all unverified students
    const studentList = await usereducation
      .find({
        isDel: false,
        instituteName: { $in: instituteIds },
        $or: [{ is_verified: false }, { is_verified: { $exists: false } }],
      })
      .populate("userId", "name email profilePicture")
      .lean()
      .limit(5);

    if (!studentList.length) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "No unverified students found.",
      });
    }

    // ✅ Step 5: Map course IDs → names efficiently
    const courseIds = [...new Set(studentList.map((s) => s.courseName))];
    const courses = await list_university_course.find({
      id: { $in: courseIds },
      is_del: 0,
    });

    const courseMap = courses.reduce((acc, course) => {
      acc[course.id] = course.name;
      return acc;
    }, {});

    // ✅ Step 6: Transform final output format
    const finalList = studentList.map((student, index) => ({
      employmentId: studentList[index]._id,
      userId: student.userId?._id || null,
      name: student.userId?.name || "Unknown",
      email: student.userId?.email || "N/A",
      details: `${
        courseMap[student.courseName] || student.courseName || "Unknown Course"
      } || ${student.duration?.from || "N/A"}-${student.duration?.to || "N/A"}`,
      photo: student.userId?.profilePicture || null,
    }));

    /* console.log(
      `✅ Returning ${finalList.length} formatted unverified students`
    ); */

    return res.status(200).json({
      success: true,
      total: finalList.length,
      data: finalList,
    });
  } catch (err) {
    console.error("❌ Error in GetunverifiedStudents:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

export const GetallStudents = async (req, res) => {
  try {
    const userId = req.userId;

    // ✅ Step 1: Verify institute linked to user
    const instituteDetails = await CompanyDetails.findOne({
      userId,
      isDel: false,
    });

    if (!instituteDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Institute not found." });
    }

    // ✅ Step 2: Fetch all matching institutes
    const listOfInstitutes = await list_university_colleges.find({
      name: instituteDetails.name,
      is_del: 0,
    });

    if (!listOfInstitutes?.length) {
      return res
        .status(404)
        .json({ success: false, message: "No institutes found." });
    }

    // ✅ Step 3: Extract institute IDs
    const instituteIds = listOfInstitutes.map((inst) => inst.id.toString());

    // ✅ Step 4: Query all  students
    const studentList = await usereducation
      .find({
        isDel: false,
        instituteName: { $in: instituteIds },
      })
      .populate("userId", "name email profilePicture")
      .lean();

    if (!studentList.length) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "No unverified students found.",
      });
    }

    // ✅ Step 5: Map course IDs → names efficiently
    const courseIds = [...new Set(studentList.map((s) => s.courseName))];
    const courses = await list_university_course.find({
      id: { $in: courseIds },
      is_del: 0,
    });

    const courseMap = courses.reduce((acc, course) => {
      acc[course.id] = course.name;
      return acc;
    }, {});

    // ✅ Step 6: Transform final output format
    const finalList = studentList.map((student, index) => ({
      employmentId: studentList[index]._id,
      userId: student.userId?._id || null,
      name: student.userId?.name || "Unknown",
      email: student.userId?.email || "N/A",
      details: `${
        courseMap[student.courseName] || student.courseName || "Unknown Course"
      } || ${student.duration?.from || "N/A"}-${student.duration?.to || "N/A"}`,
      photo: student.userId?.profilePicture || null,
    }));

    /* console.log(
      `✅ Returning ${finalList.length} formatted unverified students`
    ); */

    return res.status(200).json({
      success: true,
      total: finalList.length,
      data: finalList,
    });
  } catch (err) {
    console.error("❌ Error in GetunverifiedStudents:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

export const GetverifiedStudents = async (req, res) => {
  try {
    const userId = req.userId;

    // ✅ Step 1: Verify institute linked to user
    const instituteDetails = await CompanyDetails.findOne({
      userId,
      isDel: false,
    });

    if (!instituteDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Institute not found." });
    }

    // ✅ Step 2: Fetch all matching institutes
    const listOfInstitutes = await list_university_colleges.find({
      name: instituteDetails.name,
      is_del: 0,
    });

    if (!listOfInstitutes?.length) {
      return res
        .status(404)
        .json({ success: false, message: "No institutes found." });
    }

    // ✅ Step 3: Extract institute IDs
    const instituteIds = listOfInstitutes.map((inst) => inst.id.toString());

    // ✅ Step 4: Query all unverified students
    const studentList = await usereducation
      .find({
        isDel: false,
        instituteName: { $in: instituteIds },
        is_verified: true,
      })
      .populate("userId", "name email profilePicture")
      .lean()
      .limit(5);

    if (!studentList.length) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "No unverified students found.",
      });
    }

    // ✅ Step 5: Map course IDs → names efficiently
    const courseIds = [...new Set(studentList.map((s) => s.courseName))];
    const courses = await list_university_course.find({
      id: { $in: courseIds },
      is_del: 0,
    });

    const courseMap = courses.reduce((acc, course) => {
      acc[course.id] = course.name;
      return acc;
    }, {});

    // ✅ Step 6: Transform final output format
    const finalList = studentList.map((student, index) => ({
      employmentId: studentList[index]._id,
      userId: student.userId?._id || null,
      name: student.userId?.name || "Unknown",
      email: student.userId?.email || "N/A",
      details: `${
        courseMap[student.courseName] || student.courseName || "Unknown Course"
      } || ${student.duration?.from || "N/A"}-${student.duration?.to || "N/A"}`,
      photo: student.userId?.profilePicture || null,
    }));

    /* console.log(
      `✅ Returning ${finalList.length} formatted unverified students`
    ); */

    return res.status(200).json({
      success: true,
      total: finalList.length,
      data: finalList,
    });
  } catch (err) {
    console.error("❌ Error in GetunverifiedStudents:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

export const GetstudentDetails = async (req, res) => {
  try {
    const instituteId = req.userId;
    const { userId, employmentId } = req.query;

    if (!userId || !employmentId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: userId or employmentId",
      });
    }

    // Parallel fetch for base data
    const [user, candidateDetails, personalDetail, kyc, education] =
      await Promise.all([
        User.findById(userId, { name: 1, email: 1, gender: 1, phone_number: 1 })
          .lean()
          .exec(),

        CandidateDetails.findOne({ userId }, { dob: 1, fatherName: 1, _id: 0 })
          .lean()
          .exec(),

        personalDetails
          .findOne(
            { user: userId },
            { permanentAddress: 1, pan_number: 1, _id: 0 }
          )
          .lean()
          .exec(),

        CandidateKYC.findOne({ userId }, { pan_number: 1, _id: 0 })
          .lean()
          .exec(),

        usereducation.findById(employmentId).lean().exec(),
      ]);

    // --- Enrich gender ---
    if (user?.gender) {
      const genderDoc = await list_gender
        .findById(user.gender, { name: 1 })
        .lean()
        .exec();
      user.gender = genderDoc?.name || null;
    }

    // --- Enrich education level ---
    if (education?.level) {
      const levelDoc = await list_education_level
        .findOne({ id: education.level }, { level: 1 })
        .lean()
        .exec();
      education.levelname = levelDoc?.level || null;
    }
    // --- Enrich Course Type ---
    if (education?.courseType) {
      const courseTypeDoc = await list_course_type
        .findOne({ id: education.courseType }, { name: 1 })
        .lean()
        .exec();
      education.courseId = education.courseType || null;
      education.courseTypename = courseTypeDoc?.name || null;
    }
    //--- Enrich list_university_course ---
    if (education?.courseName) {
      const courseDoc = await list_university_course
        .findOne({ id: education.courseName }, { name: 1 })
        .lean()
        .exec();
      education.courseName_id = education.courseName || null;
      education.courseName = courseDoc?.name || null;
    }
    //-- Enrich Duration
    education.durationstring = `${education.duration?.from || "N/A"}-${
      education.duration?.to || "N/A"
    }`;
    // --- Enrich list_grading_system ---
    if (education?.gradingSystem) {
      const gradingSystemDoc = await list_grading_system
        .findOne({ id: education.gradingSystem }, { name: 1 })
        .lean()
        .exec();
      education.grading_system = education.gradingSystem || null;
      education.gradingSystem = gradingSystemDoc?.name || null;
    }

    // --- Merge all data safely ---
    const mergedData = {
      ...(user || {}),
      ...(candidateDetails || {}),
      ...(personalDetail || {}),
      ...(kyc || {}),
      ...(education || {}),
    };

    return res.status(200).json({
      success: true,
      data: mergedData,
      ///   debug: { instituteId, userId, employmentId },
    });
  } catch (err) {
    console.error("❌ Error in GetstudentDetails:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

export const UpdatestudentStatus = async (req, res) => {
  try {
    const {
      is_verified,
      employmentId,
      level,
      level_verified,
      course_type,
      courseType_verified,
      course_id,
      courseName_verified,
      duration,
      duration_verified,
      grading_system,
      gradingSystem_verified,
      marks,
      marks_verified,
      remarks,
    } = req.body;

    const instituteId = req.userId;
    console.log(instituteId);

    // ✅ Step 1: Verify institute linked to user
    const instituteDetails = await CompanyDetails.findOne({
      userId: instituteId,
      isDel: false,
    });

    if (!instituteDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Institute not found." });
    }

    if (!employmentId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: employmentId",
      });
    }
    /* update usereducation _id == employmentId  */
    const updatedUserEducation = await usereducation.findOneAndUpdate(
      { _id: employmentId },
      {
        is_verified,
        level,
        level_verified,
        courseType: course_type,
        courseType_verified,
        courseName: course_id,
        courseName_verified,
        duration,
        duration_verified,
        gradingSystem: grading_system,
        gradingSystem_verified,
        marks,
        marks_verified,
        remarks,
      },
      { new: true }
    );

    // Handle not found
    if (!updatedUserEducation) {
      return res.status(404).json({
        success: false,
        message: "Student record not found",
      });
    }

    const userId = updatedUserEducation.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let verificationStatus = `
        <ul>
          <li><strong>Level:</strong> ${
            updatedUserEducation.level_verified ? "Verified" : "Not Verified"
          }</li>
          <li><strong>Course Type:</strong> ${
            updatedUserEducation.courseType_verified
              ? "Verified"
              : "Not Verified"
          }</li>
          <li><strong>Course Name:</strong> ${
            updatedUserEducation.courseName_verified
              ? "Verified"
              : "Not Verified"
          }</li>
          <li><strong>Duration:</strong> ${
            updatedUserEducation.duration_verified ? "Verified" : "Not Verified"
          }</li>
          <li><strong>Grading System:</strong> ${
            updatedUserEducation.gradingSystem_verified
              ? "Verified"
              : "Not Verified"
          }</li>
          <li><strong>Marks:</strong> ${
            updatedUserEducation.marks_verified ? "Verified" : "Not Verified"
          }</li>
          <li><strong>Remarks:</strong> ${updatedUserEducation.remarks}</li>
        </ul>
      `;

    const emailcontent = `<p>Dear <strong>${user.name}</strong>,</p>
        <p>Your academic verification details have been updated by <strong>${instituteDetails.name}</strong>.</p>
        <p>Here is the status of your verification:</p>
        ${verificationStatus}
        <p>If you believe there is an error, please contact our support team.</p>
        <br/>
        <p>Regards,<br/>E2Score Verification Team</p>`;

    const mailOptions = {
      from: `"E2Score Team" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Academic Verification Status Updated",
      html: emailcontent,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Student status updated successfully",
      data: updatedUserEducation,
      debug: { instituteDetails },
    });
  } catch (err) {
    console.error("Error in UpdatestudentStatus:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

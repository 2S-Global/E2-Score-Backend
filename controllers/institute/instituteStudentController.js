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
      debug: { instituteId, userId, employmentId },
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

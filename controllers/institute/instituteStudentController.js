import usereducation from "../../models/userEducationModel.js";
import CompanyDetails from "../../models/company_Models/companydetails.js";
import list_university_colleges from "../../models/monogo_query/universityCollegesModel.js";
import list_university_course from "../../models/monogo_query/universityCourseModel.js";

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

    console.log(
      `✅ Returning ${finalList.length} formatted unverified students`
    );

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

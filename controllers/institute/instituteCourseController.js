
import student_course_details from "../../models/studentCourseModel.js";
import { Types } from 'mongoose';

// institute Student Course
export const instituteCourse= async (req, res) => {
  try {
    const user=req?.user
    // 2️⃣ Get Institue Course
    const CourseList = await student_course_details.find({ userId:user?.userId, is_del: 0 }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: CourseList.length,
      data: CourseList,
    });
  } catch (error) {
    console.error("Error fetching student:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
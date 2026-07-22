import CompanyDetails from "../models/company_Models/companydetails.js";
import list_university_colleges from "../models/monogo_query/universityCollegesModel.js";
import list_university_course from "../models/monogo_query/universityCourseModel.js";
import student_course_details from "../models/studentCourseModel.js";
import usereducation from "../models/userEducationModel.js";
import list_gender from "../models/monogo_query/genderModel.js";
export const studentDetails = async (user, stuId, level) => {
  try {
    // Here I have started my new code for independent candidates from user   --  started
    // ✅ Step 2: Verify institute
    const instituteDetails = await CompanyDetails.findOne({
      userId: user,
      isDel: false,
    });


    
    let selfRegisteredStudents = [];
    let formattedSelfRegisteredStudents = [];

    if (instituteDetails) {
      const listOfInstitutes = await list_university_colleges.find({
        name: instituteDetails.name,
        is_del: 0,
      });

      const instituteIds = listOfInstitutes.map((inst) =>
        inst.id.toString()
      );

      const currentYear = new Date().getFullYear();

      selfRegisteredStudents = await usereducation
        .find({
          isDel: false,
          instituteName: { $in: instituteIds },
          "duration.to": {
            $exists: true,
            $gte: currentYears
          },
          userId: stuId,
          level: level,
          is_verified: true
        })
        .populate("userId", "name email profilePicture gender phone_number")
        .lean();


      const genderIds = [
        ...new Set(
          selfRegisteredStudents
            .map(s => s.userId?.gender)
            .filter(Boolean)
        )
      ];

      const genders = await list_gender.find({
        _id: { $in: genderIds }
      }).lean();

      const genderMap = genders.reduce((acc, gender) => {
        acc[gender._id.toString()] = gender.name;
        return acc;
      }, {});











      // ✅ Step 6: Course mapping
      const courseIds = [...new Set(selfRegisteredStudents.map((s) => s.courseName))];
      const coursesOld = await list_university_course.find({
        id: { $in: courseIds },
        is_del: 0,
      });

      const mongoCourseIds = coursesOld.map((item) => item?._id.toString())
      const courses = await student_course_details.find({
        userId: user,
        course_mongo_id: { $in: mongoCourseIds },
        is_del: 0,
      });

      const courseMap = courses.reduce((acc, course) => {
        acc[course.course_sql_id] = {
          _id: course._id,
          type: course.type,
          name: course.name,
          course_durartion: course.course_durartion || '',
          courseStructure: course.courseStructure || '',
          marksType: course.marksType || '',
          total_number_of_semesters: course.total_number_of_semesters || '',
        };
        return acc;
      }, {});

      formattedSelfRegisteredStudents = selfRegisteredStudents.map(
        (student) => ({
          _id: student.userId?._id || null,
          employmentId: student._id,
          name: student.userId?.name,
          email: student.userId?.email,
          phone_number: student.userId?.phone_number,
          "tenTh": student.level == 1 ? student.marks : "",
          "twelveTh": student.level == 2 ? student.marks : "",
          profilePicture: student.userId?.profilePicture,
          isSelfRegistered: true,
          program: courseMap[student.courseName]?._id || null,
          gender: genderMap[student.userId?.gender]?.toLowerCase()?.charAt(0) || null,
          programDetails: courseMap[student.courseName] || null,
        })
      );

    }
    return formattedSelfRegisteredStudents
  } catch (error) {
    return false
  }
};
import companylist from "../../models/CompanyListModel.js";
import CompanyDetails from "../../models/company_Models/companydetails.js";
import User from "../../models/userModel.js";
import uploadToCloudinary from "../../utility/uploadToCloudinary.js";
import deleteImageByUrl from "../../utility/deleteImageByUrl.js";
import list_university_colleges from "../../models/monogo_query/universityCollegesModel.js";
import list_university_course from "../../models/monogo_query/universityCourseModel.js";
import student_course_details from "../../models/studentCourseModel.js";

/**
 * @description Add or update a company's details for the authenticated user.
 * @route POST /api/companyprofile/add_or_update_company
 * @param {object} req.body - Company details to add or update

 * @param {string} [req.body.name] - Company name
 * @param {string} [req.body.email] - Company email
 * @param {string} [req.body.phone] - Company phone number
 * @param {string} [req.body.address] - Company address
 * @param {string} [req.body.website] - Company website
 * @param {Date} [req.body.established] - Established date
 * @param {string} [req.body.teamsize] - Team size
 * @param {Array} [req.body.courses] - List of courses
 * @param {boolean} [req.body.allowinsearch] - Allow company to appear in search
 * @param {string} [req.body.about] - About the company
 * @param {object} req.files - Uploaded files
 * @param {object} [req.files.logo] - Company logo file
 * @param {object} [req.files.cover] - Company cover image file
 * @returns {object} 200 - Company details updated successfully
 * @returns {object} 400 - User ID is required
 * @returns {object} 404 - User not found
 * @returns {object} 500 - Internal server error
 */
export const AddorUpdateCompany = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      website,
      established,
      teamsize,
      courses,
      allowinsearch,
      about,
    } = req.body;

    console.log("This api is running sucessfully ! ");
    console.log("Received data:", {
      name,
      email,
      phone,
      address,
      website,
      established,
      teamsize,
      courses,
      allowinsearch,
      about,
    });

    const logo = req.files?.logo?.[0];
    const cover = req.files?.cover?.[0];
    const userId = req.userId;

    // 🔹 Safely parse courses
    let formattedCourses = [];
    if (courses) {
      try {
        const parsed = JSON.parse(courses); // parse string to array
        if (Array.isArray(parsed)) {
          formattedCourses = parsed.map((c) => c.value);
        }
      } catch (err) {
        console.error("Invalid courses JSON:", courses);
      }
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Validate user
    const user = await User.findById(userId);
    if (!user || user.is_del) {
      return res.status(404).json({ message: "User not found." });
    }

    // Handle logo and cover uploads concurrently
    const [logoResult, coverResult] = await Promise.all([
      logo
        ? uploadToCloudinary(logo.buffer, "e2score/logo", `logo-${Date.now()}`)
        : null,
      cover
        ? uploadToCloudinary(
          cover.buffer,
          "e2score/cover",
          `cover-${Date.now()}`
        )
        : null,
    ]);

    // Insert or update company
    const company = await CompanyDetails.findOneAndUpdate(
      { userId },
      {
        name: name?.trim(),
        email: email?.trim(),
        phone: phone?.trim(),
        address: address?.trim(),
        website: website?.trim(),
        established,
        teamsize,
        courses: formattedCourses, // ✅ clean array of ObjectIds
        allowinsearch: !!allowinsearch,
        about: about?.trim(),
        ...(logoResult && { logo: logoResult.secure_url }),
        ...(coverResult && { cover: coverResult.secure_url }),
      },
      { upsert: true, new: true }
    );

    // update in user table
    await User.findOneAndUpdate(
      { _id: userId },
      { $set: { name: name?.trim() } },
      { new: true }
    );

    const listOfInstitutes = await list_university_colleges.find({
      name: name,
      is_del: 0,
    });

    console.log("List of institutes found:", listOfInstitutes);

    const institute = listOfInstitutes[0];

    let courseIds = [];

    if (institute?.courses) {
      courseIds = institute.courses
        .split(",")
        .map((id) => Number(id.trim())) // convert to number (important)
        .filter(Boolean); // remove invalid values
    }
    
    console.log("Parsed Course IDs:", courseIds);

    const courseDetails = await list_university_course.find({
      id: { $in: courseIds },
      is_del: 0,
    });

    console.log("Course details:", courseDetails);

    const bulkOps = courseDetails.map((course) => ({
      updateOne: {
        filter: {
          userId: userId,
          course_sql_id: course.id, // unique per user
        },
        update: {
          $set: {
            userId: userId,
            course_mongo_id: course._id,
            course_sql_id: course.id,
            name: course.name,
            type: course.type || "",
            course_durartion: course.course_durartion || "",
            total_number_of_semesters:
              course.total_number_of_semesters || "",
            is_del: 0,
          },
        },
        upsert: true, // ✅ insert if not exists
      },
    }));

    if (bulkOps.length) {
      await student_course_details.bulkWrite(bulkOps);
    }

    console.log("Courses saved into student_course_details");

    // if (!listOfInstitutes.length) {
    //   return res
    //     .status(404)
    //     .json({ success: false, message: "No institutes found." });
    // }

    return res.status(200).json({
      success: true,
      message: "Institute details updated successfully.",
      links: {
        logo: logoResult?.secure_url || null,
        cover: coverResult?.secure_url || null,
      },
    });
  } catch (error) {
    console.error("Error in AddorUpdateCompany:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error", error });
  }
};

/**
 * @description Get the company details of the user
 * @route GET /api/companyprofile/get_company_details
 * @success {object} 200 - Company details
 * @error {object} 404 - Company not found
 * @error {object} 500 - Internal server error
 */
export const GetCompanyDetails = async (req, res) => {
  try {
    const company = await CompanyDetails.findOne({
      userId: req.userId,
      isDel: false,
    }).populate("courses", "_id name type");

    if (!company) {
      return res.status(404).json({ message: "Institute not found." });
    }

    // ✅ Format courses as { value, label }
    const formattedCourses = company.courses.map((course) => ({
      value: course._id,
      label: course.type ? `${course.name} (${course.type})` : `${course.name}`,
    }));

    const formatedData = {
      ...company.toObject(),
      courses: formattedCourses, // replace with formatted
    };

    return res.status(200).json({
      success: true,
      data: formatedData,
    });
  } catch (error) {
    console.error("Error in GetCompanyDetails:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error", error });
  }
};

/**
 * @description Delete the cover photo of the user's company
 * @route DELETE /api/companyprofile/delete_cover_photo
 * @success {object} 200 - Company details
 * @error {object} 404 - Company not found
 * @error {object} 500 - Internal server error
 */
export const Deletecoverphoto = async (req, res) => {
  try {
    const company = await CompanyDetails.findOne({
      userId: req.userId,
      isDel: false,
    });

    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Institute not found." });
    }

    // Delete from Cloudinary if cover exists
    if (company.cover) {
      const result = await deleteImageByUrl(company.cover);
      /*       console.log(result); */
    }

    // Update DB to remove cover reference
    company.cover = "";
    await company.save();

    return res.status(200).json({
      success: true,
      message: "Cover photo deleted",
    });
  } catch (error) {
    console.error("Error in Deletecoverphoto:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting cover photo",
      error: error.message,
    });
  }
};

/**
 * @description Get the account details of the user
 * @route GET /api/companyprofile/get_account_details
 * @success {object} 200 - Account details
 * @error {object} 404 - Company not found
 * @error {object} 500 - Internal server error
 */
export const GetAccountDetails = async (req, res) => {
  try {
    const company = await User.findById(req.userId);
    if (!company) {
      return res.status(404).json({ message: "Institute not found." });
    }

    const companyDetails = await CompanyDetails.findOne(
      { userId: req.userId, isDel: false },
      { name: 1 }
    ).lean();

    const companyName =
      companyDetails?.name && companyDetails.name.trim() !== ""
        ? companyDetails.name
        : company.name;

    return res.status(200).json({
      success: true,
      data: {
        companyname: companyName,
        email: company.email,
        phone: company.phone_number,
      },
    });
  } catch (error) {
    console.error("Error in GetAccountDetails:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error", error });
  }
};

export const updateAccountDetails = async (req, res) => {
  try {
    const { companyname, companyemail, companyphone } = req.body;

    // Basic validation
    if (!companyname || !companyphone) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    const company = await User.findById(req.userId);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Institute not found." });
    }

    company.name = companyname;
    // company.email = companyemail;
    company.phone_number = companyphone;

    await company.save();

    return res
      .status(200)
      .json({ success: true, message: "Account updated successfully." });
  } catch (error) {
    console.error("Error in updateAccountDetails:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error", error });
  }
};

export const syncStudentCourses = async (req, res) => {
  try {
    const userId = req.userId;

    console.log("Syncing courses for userId:", userId);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // 1️⃣ Find company
    const company = await CompanyDetails.findOne({ userId });

    console.log("Company found:", company);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // 2️⃣ Find university/college by name

    // const university = await list_university_colleges.findOne({
    //   name: company.name,
    // });

    if (!university) {
      return res.status(404).json({ message: "University not found" });
    }

    const courseIds = university.courses; // array of ObjectIds

    if (!courseIds || courseIds.length === 0) {
      return res.status(400).json({ message: "No courses found" });
    }

    // 3️⃣ Fetch all course details
    const courses = await list_all_courses.find({
      _id: { $in: courseIds },
    });

    // 4️⃣ Prepare data for insertion
    const formattedCourses = courses.map((course) => ({
      userId,
      courseId: course._id,
      courseName: course.name,
    }));

    // 5️⃣ Optional: Remove old records (to avoid duplicates)
    await studentCourseDetails.deleteMany({ userId });

    // 6️⃣ Insert new records
    await studentCourseDetails.insertMany(formattedCourses);

    return res.status(200).json({
      success: true,
      message: "Courses synced successfully",
      totalCourses: formattedCourses.length,
    });
  } catch (error) {
    console.error("Error in syncStudentCourses:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};
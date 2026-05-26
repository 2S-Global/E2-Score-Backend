import companylist from "../../models/CompanyListModel.js";
import CompanyDetails from "../../models/company_Models/companydetails.js";
import User from "../../models/userModel.js";
import uploadToCloudinary from "../../utility/uploadToCloudinary.js";
import deleteImageByUrl from "../../utility/deleteImageByUrl.js";
import list_university_colleges from "../../models/monogo_query/universityCollegesModel.js";
import list_university_course from "../../models/monogo_query/universityCourseModel.js";
import student_course_details from "../../models/studentCourseModel.js";
import CompanyByInstitute from "../../models/CompanyByInstituteModel.js";
import CompanyRequirement from "../../models/companyRequirementModel.js";
import SelectedStudent from "../../models/StudentAssignedCompanyModel.js";
import InstituteFaculty from "../../models/InstituteFacultyModel.js";
import StudentEvaluation from "../../models/EvaluationModel.js";
import mongoose from "mongoose";

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
    console.log("Add ppp");
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

export const addCompanyByInstitute = async (req, res) => {
  try {
    const userId = req.userId;

    const {
      companyName,
      sector,
      status,
      primaryContact,
      email,
      phone,
      website,
      initialOpenPositions,
      notes,
      address,
      sectors,
    } = req.body;

    // 🔹 Basic validation
    if (
      !userId ||
      !companyName ||
      !sector ||
      !primaryContact ||
      !email ||
      !phone
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    // 🔹 Check duplicate company email under same user
    const existingCompany = await CompanyByInstitute.findOne({
      userId,
      email,
      isDel: false,
    });

    if (existingCompany) {
      return res.status(409).json({
        success: false,
        message: "Company with this email already exists",
      });
    }

    // 🔹 Create company
    const newCompany = await CompanyByInstitute.create({
      userId,
      companyName,
      sector,
      status,
      primaryContact,
      email,
      phone,
      website,
      initialOpenPositions,
      notes,
      address,
      sectors
    });

    return res.status(201).json({
      success: true,
      message: "Company added successfully",
      data: newCompany,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const editCompanyByInstitute = async (req, res) => {
  try {
    const userId = req.userId;
    const companyId = req.body.id;

    console.log("Edit API is running: ");

    const {
      companyName,
      sector,
      status,
      primaryContact,
      email,
      phone,
      website,
      initialOpenPositions,
      notes,
      address,
      sectors,
    } = req.body;

    // 🔹 Validation
    if (!userId || !companyId) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    // 🔹 Duplicate email check
    if (email) {
      const duplicate = await CompanyByInstitute.findOne({
        userId,
        email,
        _id: { $ne: companyId },
        isDel: false,
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Another company with this email already exists",
        });
      }
    }

    // 🔹 Update company
    const updatedCompany = await CompanyByInstitute.findOneAndUpdate(
      {
        _id: companyId,
        userId,
        isDel: false,
      },
      {
        companyName,
        sector,
        status,
        primaryContact,
        email,
        phone,
        website,
        initialOpenPositions,
        notes,
        address,
        sectors
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // 🔹 Company not found
    if (!updatedCompany) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Company updated successfully",
      data: updatedCompany,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllCompaniesByInstitute123 = async (req, res) => {
  try {
    const userId = req.userId;
    const companyId = req.query.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid user",
      });
    }

    // 🔹 If id is provided then return single company details
    if (companyId) {
      const company = await CompanyByInstitute.findOne({
        _id: companyId,
        userId,
        isDel: false,
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Company not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Company details fetched successfully",
        data: company,
      });
    }

    const companies = await CompanyByInstitute.find({
      userId,
      isDel: false,
    }).sort({ createdAt: -1 }); // latest first

    return res.status(200).json({
      success: true,
      message: "Company list fetched successfully",
      data: companies,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllCompaniesByInstitute = async (req, res) => {
  try {
    const userId = req.userId;
    const companyId = req.query.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid user",
      });
    }

    // Single company details
    if (companyId) {
      const company = await CompanyByInstitute.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(companyId),
            userId: new mongoose.Types.ObjectId(userId),
            isDel: false,
          },
        },
        {
          $lookup: {
            from: "companyrequirements",
            let: { companyId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$company", "$$companyId"],
                  },
                },
              },
              { $sort: { createdAt: -1 } },
              { $limit: 1 },
            ],
            as: "latestRequirement",
          },
        },
        {
          $unwind: {
            path: "$latestRequirement",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);

      if (!company.length) {
        return res.status(404).json({
          success: false,
          message: "Company not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Company details fetched successfully",
        data: company[0],
      });
    }

    // Company list with latest requirement
    const companies = await CompanyByInstitute.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isDel: false,
        },
      },
      {
        $lookup: {
          from: "companyrequirements",
          let: { companyId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$companyName", "$$companyId"],
                },
              },
            },
            { $sort: { createdAt: -1 } }, // latest requirement first
            { $limit: 1 }, // take only latest
          ],
          as: "latestRequirement",
        },
      },
      {
        $unwind: {
          path: "$latestRequirement",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          "latestRequirement.createdAt": -1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Company list fetched successfully",
      data: companies,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCompanyByInstitute = async (req, res) => {
  try {
    const userId = req.userId;
    const companyId = req.query.id;

    const deletedCompany = await CompanyByInstitute.findOneAndUpdate(
      { _id: companyId, userId, isDel: false },
      { isDel: true },
      { new: true }
    );

    if (!deletedCompany) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addCompanyRequirement = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      companyName, // this is actually companyId from frontend
      examinationType,
      date,
      time,
      numberOfCandidates,
      remarks,
      role,
      numberOfOpenings,
      numberOfHired,
      ratings,
      courses,
      tenth,
      twelvth
    } = req.body;

    // Validation
    if (
      !userId ||
      !companyName
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ObjectId validation
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(companyName)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId or companyId",
      });
    }

    const newRequirement = new CompanyRequirement({
      userId,
      companyName,
      date,
      time,
      numberOfCandidates,
      remarks,
      role,
      numberOfOpenings,
      numberOfHired,
      ratings,
      courses,
      tenth,
      twelvth
    });

    const savedData = await newRequirement.save();

    return res.status(201).json({
      success: true,
      message: "Company requirement added successfully",
      data: savedData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateCompanyRequirement = async (req, res) => {
  try {
    const userId = req.userId;
    const requirementId = req.body.id;

    const {
      companyName, // companyId from frontend
      examinationType,
      remarks,
      date,
      time,
      numberOfCandidates,
      numberOfOpenings,
      numberOfHired,
      ratings
    } = req.body;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(requirementId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId or requirementId",
      });
    }

    if (companyName && !mongoose.Types.ObjectId.isValid(companyName)) {
      return res.status(400).json({
        success: false,
        message: "Invalid companyId",
      });
    }

    // Build update object dynamically (only update provided fields)
    const updateData = {};

    if (companyName) updateData.companyName = companyName;
    if (examinationType) updateData.examinationType = examinationType;
    if (remarks) updateData.remarks = remarks;
    if (date) updateData.date = date;
    if (time) updateData.time = time;
    if (numberOfCandidates)
      updateData.numberOfCandidates = numberOfCandidates;
    if (numberOfOpenings)
      updateData.numberOfOpenings = numberOfOpenings;
    if (numberOfHired)
      updateData.numberOfHired = numberOfHired;
    if (ratings)
      updateData.ratings = ratings;

    // Find and update
    const updatedRequirement = await CompanyRequirement.findOneAndUpdate(
      { _id: requirementId, userId: userId }, // ensure user owns the data
      { $set: updateData },
      { new: true } // return updated document
    );

    if (!updatedRequirement) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Company requirement updated successfully",
      data: updatedRequirement,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getAllCompanyRequirements = async (req, res) => {
  try {
    // Optional filters
    const filter = {};

    // Filter by companyId (optional)
    if (req.query.companyId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.companyId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid companyId",
        });
      }
      filter.companyName = req.query.companyId;
    }

    // Fetch all records
    const requirements = await CompanyRequirement.find(filter)
      .populate("companyName") // optional
      .populate("userId", "name email") // optional: show user info
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "All company requirements fetched successfully",
      count: requirements.length,
      data: requirements,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const deleteCompanyRequirement = async (req, res) => {
  try {
    const userId = req.userId;
    const requirementId = req.query.id;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(requirementId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId or requirementId",
      });
    }

    // Find and delete (with ownership check)
    const deletedRequirement = await CompanyRequirement.findOneAndDelete({
      _id: requirementId,
      userId: userId,
    });

    if (!deletedRequirement) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Company requirement deleted successfully",
      data: deletedRequirement,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const selectStudentForCompany = async (req, res) => {
  try {
    const instituteId = req.userId;

    const {
      studentId,
      requirementId,
      instituteCompanyId,
    } = req.body;

    // 🔹 Basic Validation
    if (!instituteId || !studentId || !requirementId || !instituteCompanyId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 🔹 ObjectId validation
    if (
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(requirementId) ||
      !mongoose.Types.ObjectId.isValid(instituteCompanyId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid IDs provided",
      });
    }

    // 🔹 Check duplicate (important)
    const alreadyExists = await SelectedStudent.findOne({
      studentId,
      requirementId,
      instituteCompanyId,
    });

    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message: "Student already scheduled for this company & requirement",
      });
    }

    // 🔹 Create entry
    const selectedStudent = await SelectedStudent.create({
      studentId,
      instituteId,
      requirementId,
      instituteCompanyId,
      isPlacement: false,
    });

    return res.status(201).json({
      success: true,
      message: "Student scheduled successfully",
      data: selectedStudent,
    });

  } catch (error) {
    console.error("Error selecting student:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const addFaculty = async (req, res) => {
  try {
    const userId = req.userId;

    const {
      full_name,
      role,
      department,
      phone_number,
      email,
      student_count,
      course_count,
      about,
      area_of_experties,
      recognitions,
      courses_name,
      office_hours,
      address
    } = req.body;

    // 🔹 Basic validation
    if (
      !userId ||
      !full_name ||
      !role ||
      !department ||
      !phone_number ||
      !email
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    // 🔹 Check duplicate company email under same user
    const existingFaculty = await InstituteFaculty.findOne({
      userId,
      email,
      isDel: false,
    });

    if (existingFaculty) {
      return res.status(409).json({
        success: false,
        message: "Faculty member with this email already exists",
      });
    }

    // 🔹 Create company
    const newFaculty = await InstituteFaculty.create({
      userId,
      full_name,
      role,
      department,
      phone_number,
      email,
      student_count,
      course_count,
      about,
      area_of_experties,
      recognitions,
      courses_name,
      office_hours,
      address
    });

    return res.status(201).json({
      success: true,
      message: "Faculty member added successfully",
      data: newFaculty,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getFaculty = async (req, res) => {
  try {

    console.log("API is hitting successfully ! ");
    const userId = req.userId;
    const facultyId = req.query.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid user",
      });
    }

    // 🔹 If id is provided then return single company details
    if (facultyId) {
      const faculty = await InstituteFaculty.findOne({
        _id: facultyId,
        userId,
        isDel: false,
      });

      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: "Faculty member not found",
        });
      }

      // Fetch corresponding course details
      const courses = await student_course_details.find(
        {
          _id: { $in: faculty.courses_name },
        },
        {
          name: 1,
        }
      );

      const facultyData = faculty.toObject();

      facultyData.course_details = courses;

      return res.status(200).json({
        success: true,
        message: "Faculty details fetched successfully",
        data: facultyData,
      });
    }

    const faculties = await InstituteFaculty.find({
      userId,
      isDel: false,
    }).sort({ createdAt: -1 }); // latest first

    return res.status(200).json({
      success: true,
      message: "Faculty list fetched successfully",
      data: faculties,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const countFaculty = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid user",
      });
    }

    const totalFaculty = await InstituteFaculty.countDocuments({
      userId,
      isDel: false,
    });

    return res.status(200).json({
      success: true,
      message: "Faculty count fetched successfully",
      totalFaculty,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const editFaculty = async (req, res) => {
  try {
    const userId = req.userId;
    const facultyId = req.body.id;

    console.log("Edit Faculty API is running: ");

    const {
      full_name,
      role,
      department,
      phone_number,
      email,
      student_count,
      course_count,
      about,
      area_of_experties,
      recognitions,
      courses_name,
      office_hours,
      address
    } = req.body;

    // 🔹 Validation
    if (!userId || !facultyId) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    // 🔹 Update faculty
    const updatedFaculty = await InstituteFaculty.findOneAndUpdate(
      {
        _id: facultyId,
        userId,
        isDel: false,
      },
      {
        full_name,
        role,
        department,
        phone_number,
        email,
        student_count,
        course_count,
        about,
        area_of_experties,
        recognitions,
        courses_name,
        office_hours,
        address
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // 🔹 Faculty member not found
    if (!updatedFaculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty member not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Faculty member updated successfully",
      data: updatedFaculty,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addEvaluation = async (req, res) => {
  try {
    const userId = req.userId;

    const {
      student_name,
      role,
      evaluation_type,
      status,
      score,
      date,
      evaluator_name,
      notes,
      location,
    } = req.body;

    // 🔹 Basic validation
    if (
      !userId ||
      !student_name ||
      !evaluation_type ||
      !status
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    // ✅ Allowed evaluation types
    const allowedEvaluationTypes = [
      "Aptitude_Coding",
      "Technical",
      "Case_Study",
      "Group_Discussion",
      "Behavioral",
      "Domain_Knowledge",
    ];

    // ✅ Validate evaluation type
    if (!allowedEvaluationTypes.includes(evaluation_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid evaluation type",
      });
    }

    // ✅ Prevent duplicate evaluation type
    const existingEvaluation = await StudentEvaluation.findOne({
      userId,
      student_name,
      evaluation_type,
      is_del: false,
    });

    // ✅ If same evaluation_type already exists
    if (existingEvaluation) {
      return res.status(400).json({
        success: false,
        message: `${evaluation_type} already exists.`,
      });
    }

    // 🔹 Create evaluation
    const newEvaluation = await StudentEvaluation.create({
      userId,
      student_name,
      role,
      evaluation_type,
      status,
      score,
      date,
      evaluator_name,
      notes,
      location
    });

    return res.status(201).json({
      success: true,
      message: "Student evaluation added successfully",
      data: newEvaluation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEvaluation = async (req, res) => {
  try {
    const userId = req.userId;
    const evaluationId = req.query.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid user",
      });
    }

    // 🔹 If id is provided then return single evaluation details
    if (evaluationId) {
      const evaluation = await StudentEvaluation.findOne({
        _id: evaluationId,
        userId,
        isDel: false,
      }).populate("student_name", "name");

      if (!evaluation) {
        return res.status(404).json({
          success: false,
          message: "Evaluation not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Evaluation details fetched successfully",
        data: evaluation,
      });
    }

    // ✅ Group by student_name
    const evaluations = await StudentEvaluation.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isDel: false,
        },
      },

      // 🔹 Join with students collection
      {
        $lookup: {
          from: "instituestudents", // collection name in MongoDB
          localField: "student_name",
          foreignField: "_id",
          as: "student",
        },
      },

      // 🔹 Convert array to object
      {
        $unwind: "$student",
      },

      // Group by student_name
      {
        $group: {
          _id: "$student_name",

          // return student name
          student_name: {
            $first: "$student.name",
          },

          evaluations: {
            $push: {
              evaluation_id: "$_id",
              role: "$role",
              evaluation_type: "$evaluation_type",
              status: "$status",
              score: "$score",
              date: "$date",
              evaluator_name: "$evaluator_name",
              notes: "$notes",
              location: "$location",
            },
          },
        },
      },

      // Optional sorting
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Evaluations fetched successfully",
      data: evaluations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const editEvaluation = async (req, res) => {
  try {
    const userId = req.userId;
    const evaluationId = req.body.id;

    console.log("Edit Evaluation API is running: ");

    const {
      student_name,
      role,
      evaluation_type,
      status,
      score,
      date,
      evaluator_name,
      notes,
      location,
    } = req.body;

    // 🔹 Validation
    if (!userId || !evaluationId) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    // 🔹 evaluation_type validation
    if (
      evaluation_type &&
      !Array.isArray(evaluation_type)
    ) {
      return res.status(400).json({
        success: false,
        message: "evaluation_type must be an array",
      });
    }

    // 🔹 Update evaluation
    const updatedEvaluation =
      await StudentEvaluation.findOneAndUpdate(
        {
          _id: evaluationId,
          userId,
          isDel: false,
        },
        {
          student_name,
          role,
          evaluation_type,
          status,
          score,
          date,
          evaluator_name,
          notes,
          location,
        },
        {
          new: true,
          runValidators: true,
        }
      ).populate("student_name", "name");

    // 🔹 Evaluation not found
    if (!updatedEvaluation) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Evaluation updated successfully",
      data: updatedEvaluation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteEvaluation = async (req, res) => {
  try {
    const userId = req.userId;
    const evaluationId = req.query.id;

    // 🔹 Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(evaluationId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId or evaluationId",
      });
    }

    // 🔹 Soft delete evaluation
    const deletedEvaluation =
      await StudentEvaluation.findOneAndUpdate(
        {
          _id: evaluationId,
          userId,
          isDel: false,
        },
        {
          isDel: true,
        },
        {
          new: true,
        }
      );

    // 🔹 Evaluation not found
    if (!deletedEvaluation) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Evaluation deleted successfully",
      data: deletedEvaluation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
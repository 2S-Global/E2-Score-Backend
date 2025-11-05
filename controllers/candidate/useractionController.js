import User from "../../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import PersonalDetails from "../../models/personalDetails.js";
import CandidateDetails from "../../models/CandidateDetailsModel.js";
import db_sql from "../../config/sqldb.js";
import UserEducation from "../../models/userEducationModel.js";
import axios from "axios";
import FormData from "form-data";
import UserCareer from "../../models/CareerModel.js";
import ResumeDetails from "../../models/resumeDetailsModels.js";
import list_key_skill from "../../models/monogo_query/keySkillModel.js";
import mongoose from "mongoose";
import list_industries from "../../models/monogo_query/industryModel.js";
import list_department from "../../models/monogo_query/departmentsModel.js";
import list_job_role from "../../models/monogo_query/jobRolesModel.js";
import list_india_cities from "../../models/monogo_query/indiaCitiesModel.js";
import list_university_univercities from "../../models/monogo_query/universityUniversityModel.js";
import list_education_boards from "../../models/monogo_query/educationBoardModel.js";
import list_university_colleges from "../../models/monogo_query/universityCollegesModel.js";
import list_university_course from "../../models/monogo_query/universityCourseModel.js";
import list_school_list from "../../models/monogo_query/schoolListModel.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * @route POST /api/useraction/update-profile-picture
 * @summary Upload or update the user's profile picture
 * @description This endpoint uploads a new profile picture for the authenticated user to Cloudinary.
 *              It deletes the old picture if it exists and updates the user's profile with the new URL.
 * @security BearerAuth
 * @param {file} file.formData.required - Profile picture file (image)
 * @returns {object} 200 - Profile picture updated successfully
 * @returns {object} 400 - No file uploaded
 * @returns {object} 404 - User not found
 * @returns {object} 500 - Error adding profile picture
 */
//Add profile picture
export const addProfilePicture = async (req, res) => {
  try {
    const user_id = req.userId;
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: "e2score/profile_picture" },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          )
          .end(req.file.buffer);
      });
    };

    const oldProfilePicture = user.profilePicture;
    let oldPublicId = null;

    if (oldProfilePicture) {
      // Extract the public ID from the old image URL
      const oldImageUrlParts = oldProfilePicture.split("/");
      oldPublicId = oldImageUrlParts[oldImageUrlParts.length - 1].split(".")[0];
    }
    // Upload the new file to Cloudinary
    const result = await uploadToCloudinary();
    const profilePictureUrl = result.secure_url;

    // If there was an old image, delete it from Cloudinary
    if (oldPublicId) {
      await cloudinary.uploader.destroy(
        `e2score/profile_picture/${oldPublicId}`
      );
    }

    // Update the user's profile with the new picture URL
    const updatedUser = await User.findByIdAndUpdate(
      user_id,
      { profilePicture: profilePictureUrl },
      { new: true }
    );

    res.status(200).json({
      message: "Profile picture updated successfully",
      profilePicture: profilePictureUrl,
    });
  } catch (error) {
    console.error("Error adding profile picture:", error);
    res.status(500).json({ message: "Error adding profile picture" });
  }
};

/**
 * @route POST /api/useraction/resumeheadline
 * @summary Add or update the user's resume headline
 * @description This endpoint adds a new resume headline for the authenticated user.
 *              It deletes the old resume title if it exists and updates the user's resume headline with the new URL.
 * @security BearerAuth
 * @param {text} file.formData.required - Resume Headline (resumeHeadline)
 * @returns {object} 200 - Resume Headline saved successfully
 * @returns {object} 400 - ResumeHeadline are required.
 * @returns {object} 500 - Error saving resumeHeadline
 */

// Add Resume Headline add test comand new
export const addResumeHeadline = async (req, res) => {
  try {
    const { resumeHeadline } = req.body;
    const user = req.userId;
    if (!user || !resumeHeadline) {
      return res.status(400).json({ message: "ResumeHeadline are required." });
    }

    // Update the user's profile with the new picture URL
    const updated = await PersonalDetails.findOneAndUpdate(
      { user: user },
      { resumeHeadline: resumeHeadline },
      { new: true, upsert: true }
    );

    res.status(201).json({
      success: true,
      message: "Resume Headline Saved successfully!",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error saving resumeHeadline", error: error.message });
  }
};

/**
 * @description Delete the profile summary of the authenticated user.
 * @route DELETE /api/useraction/delete_profile_summary
 * @access protected
 * @param {Object} req - Express request object containing userId
 * @param {Object} res - Express response object
 * @returns {Object} 200 - Profile summary deleted successfully
 * @returns {Object} 404 - No personal details found for this user
 * @returns {Object} 500 - Server error while deleting profile summary
 */
export const deleteProfileSummary = async (req, res) => {
  try {
    const userId = req.userId;

    const personal = await PersonalDetails.findOne({ user: userId });

    if (!personal) {
      return res.status(404).json({
        message: "No personal details found for this user.",
      });
    }

    // Unset the profileSummary field (soft delete)
    await PersonalDetails.updateOne(
      { user: userId },
      { $unset: { profileSummary: "" } }
    );

    return res.status(200).json({
      success: true,
      message: "Profile Summary deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while deleting profile summary",
      error: error.message,
    });
  }
};

/**
 * @route POST /api/useraction/update-user-details
 * @summary Update the user's personal details
 * @description This endpoint updates the user's personal details.
 *              It updates the user's profile with the new details and
 *              updates the user's personal details with the new details.
 * @security BearerAuth
 * @param {object} req.body - Details to update
 * @param {string} req.body.full_name - Full name
 * @param {string} req.body.gender - Gender
 * @param {date} req.body.dob - Date of birth
 * @param {string} req.body.country - Country
 * @param {string} req.body.currentLocation - Current location
 * @param {string} req.body.hometown - Hometown
 * @returns {object} 201 - User details saved successfully
 * @returns {object} 400 - Validation error
 * @returns {object} 404 - User not found
 * @returns {object} 500 - Error saving user details
 */
export const updateUserDetails = async (req, res) => {
  try {
    const user_id = req.userId;
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      full_name,
      gender,
      dob,
      country,
      currentLocation,
      hometown,
      father_name,
      salary,
      currency
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(user_id, {
      name: full_name,
      gender: gender || "",
      updatedAt: new Date(),
    });

    const personalDetails = await CandidateDetails.findOneAndUpdate(
      { userId: user_id },
      {
        dob: dob,
        country_id: country,
        currentLocation: currentLocation,
        hometown: hometown,
        fatherName: father_name,
        currentSalary: {
          currency: currency,
          salary: salary,
        },
        updatedAt: new Date(),
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.status(201).json({
      success: true,
      message: "User Details Saved successfully!",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error saving resumeHeadline", error: error.message });
  }
};

/**
 * @route POST /api/useraction/profilesummary
 * @summary Add or update the user's Profile Summary
 * @description This endpoint adds a new Profile Summary for the authenticated user.
 *              It deletes the old Profile Summary if it exists and updates the user's Profile Summary with the new URL.
 * @security BearerAuth
 * @param {text} file.formData.required - Profile Summary (profileSummary)
 * @returns {object} 200 - Profile Summary Saved successfully!
 * @returns {object} 400 - Profile Summary is required.
 * @returns {object} 500 - Error saving Profile Summary
 */

// Add Profile Summary
export const addProfileSummary = async (req, res) => {
  try {
    const { profileSummary } = req.body;
    const user = req.userId;

    if (!user || !profileSummary) {
      return res.status(400).json({ message: "Profile Summary is required." });
    }

    // Update the user's profile with the new picture URL
    const updated = await PersonalDetails.findOneAndUpdate(
      { user: user },
      { profileSummary: profileSummary },
      { new: true, upsert: true }
    );

    res.status(201).json({
      success: true,
      message: "Profile Summary Saved successfully!",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error saving Profile Summary", error: error.message });
  }
};

// Add Key Skills
/**
 * @route POST /api/useraction/keyskills
 * @summary Add or update Key Skills
 * @description This endpoint adds a new Key Skills for the authenticated user.
 *              It deletes the old Key Skills if it exists and updates the user's Key Skills with the new URL.
 * @security BearerAuth
 * @param {text} file.formData.required - Key Skills (skills)
 * @returns {object} 200 - Skills saved successfully!
 * @returns {object} 400 - Skills must be a non-empty array of strings..
 * @returns {object} 500 - Error saving skills
 */
export const addKeySkillsBySql = async (req, res) => {
  try {
    const { skills } = req.body;
    const user = req.userId;

    if (!user) {
      return res.status(400).json({ message: "User ID is missing." });
    }

    if (!Array.isArray(skills) || skills.length === 0) {
      return res
        .status(400)
        .json({ message: "Skills must be a non-empty array of strings." });
    }

    const allStrings = skills.every((skill) => typeof skill === "string");
    if (!allStrings) {
      return res.status(400).json({ message: "All skills must be strings." });
    }

    //Get skill IDs from SQL
    const placeholders = skills.map(() => "?").join(", ");
    const [rows] = await db_sql.execute(
      `SELECT id, Skill FROM key_skills WHERE Skill IN (${placeholders})`,
      skills
    );

    const skillMap = {};
    rows.forEach((row) => {
      skillMap[row.Skill] = row.id;
    });

    //Check for missing skills
    const missingSkills = skills.filter((skill) => !skillMap[skill]);
    if (missingSkills.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some skills not found in SQL table.",
        missingSkills,
      });
    }

    //Convert to comma-separated string of IDs
    const skillIds = skills.map((skill) => skillMap[skill]).join(",");

    //Save in MongoDB
    await PersonalDetails.findOneAndUpdate(
      { user },
      { skills: skillIds },
      { upsert: true, new: true }
    );

    return res.status(201).json({
      success: true,
      message: "Skill IDs saved successfully!",
      data: skillIds,
    });
  } catch (error) {
    console.error("Error saving skills:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const addKeySkills = async (req, res) => {
  try {
    const { skills } = req.body;
    const user = req.userId;

    if (!user) {
      return res.status(400).json({ message: "User ID is missing." });
    }

    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        message: "Skills must be a non-empty array of strings.",
      });
    }

    // Case: If skills came as a string from form-data
    let parsedSkills = skills;
    if (typeof skills === "string") {
      try {
        parsedSkills = JSON.parse(skills);
      } catch (e) {
        return res.status(400).json({ message: "Invalid skills format." });
      }
    }

    const allStrings = parsedSkills.every((skill) => typeof skill === "string");
    if (!allStrings) {
      return res.status(400).json({ message: "All skills must be strings." });
    }

    // ✅ Normalize: lowercase and trim spaces
    parsedSkills = parsedSkills.map((s) => s.trim().toLowerCase());

    const regexArray = parsedSkills.map(
      (skill) => new RegExp(`^${skill}$`, "i")
    );
    // Find matching skills in MongoDB
    const matchedSkills = await list_key_skill.find(
      {
        Skill: { $in: regexArray },
        is_del: 0,
        is_active: 1,
      },
      "_id Skill"
    );

    const skillMap = {};
    matchedSkills.forEach((row) => {
      skillMap[row.Skill] = row._id;
    });

    const missingSkills = parsedSkills.filter((skill) => !skillMap[skill]);
    if (missingSkills.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some skills not found in the database.",
        missingSkills,
      });
    }

    const skillObjectIds = parsedSkills.map((skill) => skillMap[skill]);

    // Save ObjectIds array to skills field
    await PersonalDetails.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(user) },
      { skills: skillObjectIds },
      { upsert: true, new: true }
    );

    return res.status(201).json({
      success: true,
      message: "Skills saved successfully!",
      data: skillObjectIds,
    });
  } catch (error) {
    console.error("Error saving skills:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Upload a file to an external server using Axios and FormData.
 *
 * @param {Express.Multer.File} file - The file to upload
 * @returns {Promise<string | null>} The file path if successful, or null if not
 */
export const uploadFileToExternalServer = async (file) => {
  const form = new FormData();
  form.append("file", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  try {
    const response = await axios.post(
      "https://a2zcart.uk/e2score/fileupload/upload.php",
      form,
      { headers: form.getHeaders() }
    );

    return response.data?.file_path;
  } catch (error) {
    console.error("Error during file upload:", error.message);
    if (error.response) {
      console.error("Error response from server:", error.response.data);
    }
    return null;
  }
};

/**
 * Finds the ID of a row with the given value in the specified column
 * (case-insensitive) and table. If not found, inserts a new row with that
 * value and returns the new ID.
 *
 * @param {string} tableName The name of the table to search in
 * @param {string} columnName The name of the column to search by
 * @param {string} value The value to search for
 * @returns {Promise<number | null>} The ID of the matching row, or null if no
 *     match was found and no new row was inserted (e.g. if the value is empty)
 */

async function getOrInsertIdBySql(tableName, columnName, value) {
  if (!value || typeof value !== "string") {
    return null;
  }
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }
  const [existingRows] = await db_sql.execute(
    `SELECT id FROM ${tableName} WHERE ${columnName} = ? AND is_del = 0 AND is_active = 1`,
    [value.trim()]
  );
  if (existingRows.length > 0) {
    return existingRows[0].id;
  }
  // If not found, insert new row
  const [insertResult] = await db_sql.execute(
    `INSERT INTO ${tableName} (${columnName}, is_active, is_del, flag) VALUES (?, 0, 0, 1)`,
    [trimmedValue]
  );
  return insertResult.insertId;
}

async function getOrInsertId(
  model,
  fieldName,
  value,
  additionalFieldName = null,
  additionalFieldValue = null
) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  const filter = {
    [fieldName]: trimmedValue,
    is_del: 0,
  };

  const existingDoc = await model.findOne(filter, { id: 1 }).lean();

  if (existingDoc) {
    return existingDoc.id;
  }

  const lastDoc = await model.findOne({}).sort({ id: -1 }).lean();
  const lastInsertedId = lastDoc?.id || 0;

  const docData = {
    id: lastInsertedId + 1,
    [fieldName]: trimmedValue,
    is_active: 0,
    is_del: 0,
    flag: 1,
  };

  if (
    additionalFieldName &&
    additionalFieldValue !== undefined &&
    additionalFieldValue !== null &&
    additionalFieldValue !== ""
  ) {
    docData[additionalFieldName] = additionalFieldValue;
  }

  const newDoc = new model(docData);
  const savedDoc = await newDoc.save();
  return savedDoc.id;
}

/**
 * @route POST /api/useraction/usereducation
 * @summary Submit or update the user's education details
 * @description This endpoint allows the authenticated user to submit or update their education details.
 *              It handles both primary and non-primary education levels and uploads transcript and certificate files if provided.
 * @security BearerAuth
 * @param {object} req.body - Education details
 * @param {string} req.body.level - Education level ID
 * @param {string} req.body.state - State of education
 * @param {string} [req.body.board] - Board of education (optional)
 * @param {string} req.body.year_of_passing - Year of passing
 * @param {string} req.body.medium - Medium of education
 * @param {string} req.body.marks - Marks obtained
 * @param {string} [req.body.university] - University name (for non-primary education)
 * @param {string} [req.body.instituteName] - Institute name (for non-primary education)
 * @param {string} [req.body.course_name] - Course name (for non-primary education)
 * @param {string} [req.body.course_type] - Course type (for non-primary education)
 * @param {number} [req.body.start_year] - Start year (for non-primary education)
 * @param {number} [req.body.end_year] - End year (for non-primary education)
 * @param {string} [req.body.grading_system] - Grading system (for non-primary education)
 * @param {boolean} [req.body.isPrimary] - Indicates if the education is primary
 * @param {Express.Multer.File} [req.files.transcript] - Transcript file (optional)
 * @param {Express.Multer.File} [req.files.certificate] - Certificate file (optional)
 * @returns {object} 201 - Education saved/updated successfully
 * @returns {object} 500 - Error saving User Education
 */
export const submitUserEducation = async (req, res) => {
  try {
    const data = req.body;
    const user = req.userId;
    const levelId = data.level;
    const transcript = req.files?.transcript?.[0];
    const certificate = req.files?.certificate?.[0];
    let transcriptUrl = null;
    let certificateUrl = null;

    // Upload transcript file if available
    if (transcript) {
      transcriptUrl = await uploadFileToExternalServer(transcript);
    }
    // Upload certificate file if available
    if (certificate) {
      certificateUrl = await uploadFileToExternalServer(certificate);
    }
    // Convert is_primary to boolean
    const isPrimary = data.is_primary === "true" || data.is_primary === true;

    // Reset other primary flags if this one is primary
    if (isPrimary) {
      await UserEducation.updateMany(
        { userId: user, isPrimary: true, isDel: false },
        { $set: { isPrimary: false } }
      );
    }
    let savedRecord;
    if (levelId === "1" || levelId === "2") {
      const boardId = await getOrInsertId(
        list_education_boards,
        "board_name",
        data.board
      );
      const schoolId = await getOrInsertId(
        list_school_list,
        "school_name",
        data.school_name,
        "board_id",
        boardId
      );

      const educationData = {
        userId: user,
        level: levelId,
        state: data.state,
        board: boardId || null,
        school_name: schoolId || null,
        year_of_passing: data.year_of_passing,
        medium_of_education: data.medium,
        marks: data.marks,
        eng_marks: data.eng_marks,
        math_marks: data.math_marks,
        transcript_data: transcriptUrl || null,
        certificate_data: certificateUrl || null,
        isPrimary: data.is_primary || false,
        isDel: false,
      };
      // Update if already exists
      const existing = await UserEducation.findOne({
        userId: user,
        level: levelId,
        isDel: false,
      });
      if (existing) {
        savedRecord = await UserEducation.findByIdAndUpdate(
          existing._id,
          educationData,
          { new: true }
        );
      } else {
        const newRecord = new UserEducation(educationData);
        savedRecord = await newRecord.save();
      }
    } else {
      const [universityId, instituteId, courseId] = await Promise.all([
        getOrInsertId(list_university_univercities, "name", data.university),
        getOrInsertId(list_university_colleges, "name", data.institute_name),
        getOrInsertId(list_university_course, "name", data.course_name),
      ]);

      const educationData = {
        userId: user,
        level: levelId,
        state: data.state,
        universityName: universityId,
        instituteName: instituteId,
        courseName: courseId,
        courseType: data.course_type,
        duration: {
          from: Number(data.start_year),
          to: Number(data.end_year),
        },
        gradingSystem: data.grading_system,
        marks: data.marks,
        transcript_data: transcriptUrl || null,
        certificate_data: certificateUrl || null,
        isPrimary: data.is_primary || false,
        isDel: false,
      };
      // Always create new record
      const newRecord = new UserEducation(educationData);
      savedRecord = await newRecord.save();
    }
    res.status(201).json({
      message: `Education ${levelId === "1" || levelId === "2" ? "saved/updated" : "saved"
        } successfully`,
      data: savedRecord,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error saving User Education",
      error: error.message,
    });
  }
};

/**
 * @description Update an existing education record
 * @route PUT /api/userdata/usereducation
 * @access protected
 * @param {string} req.body._id - Education record id
 * @param {string} req.body.level - Education level (1/2/3)
 * @param {string} req.body.state - State of education
 * @param {string} [req.body.board] - Board of education (optional)
 * @param {string} req.body.year_of_passing - Year of passing
 * @param {string} req.body.medium - Medium of education
 * @param {string} req.body.marks - Marks obtained
 * @param {string} [req.body.university] - University name (for non-primary education)
 * @param {string} [req.body.instituteName] - Institute name (for non-primary education)
 * @param {string} [req.body.course_name] - Course name (for non-primary education)
 * @param {string} [req.body.course_type] - Course type (for non-primary education)
 * @param {number} [req.body.start_year] - Start year (for non-primary education)
 * @param {number} [req.body.end_year] - End year (for non-primary education)
 * @param {string} [req.body.grading_system] - Grading system (for non-primary education)
 * @param {boolean} [req.body.isPrimary] - Indicates if the education is primary
 * @param {Express.Multer.File} [req.files.transcript] - Transcript file (optional)
 * @param {Express.Multer.File} [req.files.certificate] - Certificate file (optional)
 * @returns {object} 201 - Education saved/updated successfully
 * @returns {object} 500 - Error saving User Education
 */
export const updateUserEducation = async (req, res) => {
  try {
    const data = req.body;
    const user = req.userId;
    const levelId = data.level;
    const transcript = req.files?.transcript?.[0];
    const certificate = req.files?.certificate?.[0];
    const edit_id = req.body._id;
    if (!edit_id) {
      return res.status(400).json({ message: "Education id is required." });
    }
    const existingRecord = await UserEducation.findOne({
      _id: edit_id,
      userId: user,
    });
    if (!existingRecord) {
      return res
        .status(404)
        .json({ message: "Education record not found or not authorized." });
    }
    // Upload only if file is present, otherwise keep existing values
    const transcriptUrl = transcript
      ? await uploadFileToExternalServer(transcript)
      : existingRecord.transcript_data;
    const certificateUrl = certificate
      ? await uploadFileToExternalServer(certificate)
      : existingRecord.certificate_data;

    // Convert is_primary to boolean
    const isPrimary = data.is_primary === "true" || data.is_primary === true;

    // Reset other primary flags if this one is primary
    if (isPrimary) {
      await UserEducation.updateMany(
        { userId: user, isPrimary: true, isDel: false },
        { $set: { isPrimary: false } }
      );
    }
    let savedRecord;
    if (levelId == "1" || levelId == "2") {
      // const boardId = await getOrInsertId(
      //   "education_boards",
      //   "board_name",
      //   data.board
      // );

      const boardId = await getOrInsertId(
        list_education_boards,
        "board_name",
        data.board
      );
      // const schoolId = await getOrInsertId(list_school_list, "school_name", data.school_name);
      const schoolId = await getOrInsertId(
        list_school_list,
        "school_name",
        data.school_name,
        "board_id",
        boardId
      );

      const educationData = {
        userId: user,
        level: levelId,
        state: data.state,
        board: boardId || null,
        school_name: schoolId || null,
        year_of_passing: data.year_of_passing,
        medium_of_education: data.medium,
        marks: data.marks,
        eng_marks: data.eng_marks,
        math_marks: data.math_marks,
        transcript_data: transcriptUrl,
        certificate_data: certificateUrl,
        isPrimary: data.is_primary || false,
        isDel: false,
      };

      savedRecord = await UserEducation.findByIdAndUpdate(
        edit_id,
        educationData,
        { new: true }
      );
    } else {
      /*
      const universityId = await getOrInsertId(
        "university_univercity",
        "name",
        data.university
      );
      const instituteId = await getOrInsertId(
        "university_college",
        "name",
        data.institute_name
      );
      const courseId = await getOrInsertId(
        "university_course",
        "name",
        data.course_name
      );  */

      /*
      const universityId = await getOrInsertId(
        "list_university_univercities",
        "name",
        data.university
      );

      const instituteId = await getOrInsertId(
        "list_university_colleges",
        "name",
        data.institute_name
      );
      const courseId = await getOrInsertId(
        "list_university_course",
        "name",
        data.course_name
      );  */

      const [universityId, instituteId, courseId] = await Promise.all([
        getOrInsertId(list_university_univercities, "name", data.university),
        getOrInsertId(list_university_colleges, "name", data.institute_name),
        getOrInsertId(list_university_course, "name", data.course_name),
      ]);

      const educationData = {
        userId: user,
        level: levelId,
        state: data.state,
        universityName: universityId,
        instituteName: instituteId,
        courseName: courseId,
        courseType: data.course_type,
        duration: {
          from: Number(data.start_year),
          to: Number(data.end_year),
        },
        gradingSystem: data.grading_system,
        marks: data.marks,
        transcript_data: transcriptUrl || null,
        certificate_data: certificateUrl || null,
        isPrimary: data.is_primary || false,
        isDel: false,
      };
      savedRecord = await UserEducation.findByIdAndUpdate(
        edit_id,
        educationData,
        { new: true }
      );
    }

    res.status(201).json({
      message: `Education ${levelId === "1" || levelId === "2" ? "saved/updated" : "saved"
        } successfully`,
      data: savedRecord,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error saving User Education",
      error: error.message,
    });
  }
};

/**
 * @description Soft delete an education record by user ID and education record ID
 * @route DELETE /api/useraction/delete-user-education
 * @access protected
 * @param {string} _id - Education record ID (required)
 * @returns {object} 200 - Education record deleted successfully
 * @returns {object} 400 - Missing _id in query parameters
 * @returns {object} 404 - Education record not found or already deleted
 * @returns {object} 500 - Server error
 */

export const deleteUserEducation = async (req, res) => {
  try {
    const userId = req.userId;
    const educationId = req.query._id;

    if (!educationId) {
      return res.status(400).json({
        message: "Missing _id (education record ID) in query parameters",
      });
    }

    const educationRecord = await UserEducation.findOne({
      _id: educationId,
      userId: userId,
      isDel: false,
    });

    if (!educationRecord) {
      return res.status(404).json({
        message: "Education record not found or already deleted.",
      });
    }

    // Soft delete: mark as deleted
    educationRecord.isDel = true;
    await educationRecord.save();

    return res.status(200).json({
      message: "Education record deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting user education:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @description Add or update a user's Career Profile
 * @route POST /api/useraction/add_career_profile
 * @access protected
 * @param {string} industry - User's current industry
 * @param {string} department - User's current department
 * @param {string} job_role - User's current job role
 * @param {string} job_type - Desired job type
 * @param {string} employment_type - Desired employment type
 * @param {string} work_location - User's preferred work location
 * @param {string} currency_type - Currency type for expected salary
 * @param {number} expected_salary - User's expected salary
 * @param {string} shift - User's preferred shift
 * @returns {object} 200 - Career profile saved/updated successfully
 * @returns {object} 400 - Missing required fields or invalid data
 * @returns {object} 500 - Server error
 */
export const addCareerProfile = async (req, res) => {
  try {
    const {
      industry,
      department,
      job_role,
      job_type,
      employment_type,
      work_location,
      currency_type,
      expected_salary,
      shift,
    } = req.body;

    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    if (!industry || !department || !job_role) {
      return res.status(400).json({
        message: "industry, department, and job_role are required fields",
        success: false,
      });
    }

    const expectedSalary = {
      currency: currency_type || "",
      salary: expected_salary || 0,
    };

    const dataToSave = {
      CurrentIndustry: industry,
      CurrentDepartment: department,
      JobRole: job_role,
      DesiredJob: job_type,
      DesiredEmployment: employment_type,
      location: work_location,
      expectedSalary,
      PreferredShift: shift,
    };

    const existing = await UserCareer.findOne({ userId, isDel: false });

    if (existing) {
      const updated = await UserCareer.findOneAndUpdate(
        { userId },
        dataToSave,
        { new: true }
      );

      return res.status(200).json({
        message: "Career profile updated successfully",
        data: updated,
        success: true,
      });
    }

    const newCareer = new UserCareer({
      userId,
      ...dataToSave,
    });

    await newCareer.save();

    res.status(200).json({
      message: "Career profile saved successfully",
      data: newCareer,
      success: true,
    });
  } catch (error) {
    console.error("Error saving Career Profile:", error.message);
    res.status(500).json({
      message: "Error saving Career Profile",
      error: error.message,
    });
  }
};

/**
 * @description Get the career profile of the authenticated user
 * @route GET /api/useraction/get_career_profile
 * @access protected
 * @returns {object} 200 - Career profile details
 * @returns {object} 400 - User not authenticated
 * @returns {object} 404 - Career profile not found
 * @returns {object} 500 - Error fetching Career Profile
 */
export const getCareerProfileBySql = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    const careerProfile = await UserCareer.findOne({
      userId,
      isDel: false,
    }).lean();

    if (!careerProfile) {
      return res.status(404).json({
        message: "Career profile not found",
        success: false,
      });
    }

    const {
      CurrentIndustry,
      CurrentDepartment,
      JobRole,
      DesiredJob,
      DesiredEmployment,
      location,
      expectedSalary,
      PreferredShift,
    } = careerProfile;

    // location is already stored as array in MongoDB
    const locationIds = Array.isArray(location) ? location : [];

    const [industryResult, departmentResult, jobRoleResult, locationResult] =
      await Promise.all([
        CurrentIndustry
          ? db_sql.execute("SELECT job_industry FROM industries WHERE id = ?", [
            CurrentIndustry,
          ])
          : Promise.resolve([[]]),
        CurrentDepartment
          ? db_sql.execute(
            "SELECT job_department FROM departments WHERE id = ?",
            [CurrentDepartment]
          )
          : Promise.resolve([[]]),
        JobRole
          ? db_sql.execute("SELECT job_role FROM job_roles WHERE id = ?", [
            JobRole,
          ])
          : Promise.resolve([[]]),
        locationIds.length > 0
          ? db_sql.execute(
            `SELECT id, city_name FROM india_cities WHERE id IN (${locationIds
              .map(() => "?")
              .join(", ")})`,
            locationIds
          )
          : Promise.resolve([[]]),
      ]);

    const industryName = industryResult[0][0]?.job_industry || "";
    const departmentName = departmentResult[0][0]?.job_department || "";
    const jobRoleName = jobRoleResult[0][0]?.job_role || "";
    const locationMap = new Map(
      locationResult[0].map((row) => [row.id, row.city_name])
    );

    const locationNames = locationIds
      .map((id) => locationMap.get(id) || "")
      .join(", ");

    return res.status(200).json({
      message: "Career profile fetched successfully",
      success: true,
      data: {
        industry: CurrentIndustry || "",
        industry_name: industryName,
        department: CurrentDepartment || "",
        department_name: departmentName,
        job_role: JobRole || "",
        job_role_name: jobRoleName,
        job_type: DesiredJob || "",
        employment_type: DesiredEmployment || "",
        work_location: locationIds,
        work_location_name: locationNames,
        currency_type: expectedSalary?.currency || "",
        expected_salary: expectedSalary?.salary || 0,
        shift: PreferredShift || "",
      },
    });
  } catch (error) {
    console.error("Error fetching Career Profile:", error.message);
    return res.status(500).json({
      message: "Error fetching Career Profile",
      error: error.message,
      success: false,
    });
  }
};

export const getCareerProfile = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    const careerProfile = await UserCareer.findOne({
      userId,
      isDel: false,
    }).lean();

    if (!careerProfile) {
      return res.status(404).json({
        message: "Career profile not found",
        success: false,
      });
    }

    const {
      CurrentIndustry,
      CurrentDepartment,
      JobRole,
      DesiredJob,
      DesiredEmployment,
      location,
      expectedSalary,
      PreferredShift,
    } = careerProfile;

    const locationIds = Array.isArray(location) ? location : [];

    //list_industries

    const [industryDoc, departmentDoc, jobRoleDoc, cityDocs] =
      await Promise.all([
        CurrentIndustry
          ? list_industries
            .findOne({ id: CurrentIndustry })
            .select("job_industry")
            .lean()
          : null,
        CurrentDepartment
          ? list_department
            .findOne({ id: CurrentDepartment })
            .select("job_department")
            .lean()
          : null,
        JobRole
          ? list_job_role.findById(JobRole).select("job_role").lean()
          : null,
        locationIds.length > 0
          ? list_india_cities
            .find({ _id: { $in: locationIds } })
            .select("city_name")
            .lean()
          : [],
      ]);

    const locationNames = cityDocs.map((city) => city.city_name).join(", ");

    return res.status(200).json({
      message: "Career profile fetched successfully",
      success: true,
      data: {
        industry: CurrentIndustry || "",
        industry_name: industryDoc?.job_industry || "",
        department: CurrentDepartment || "",
        department_name: departmentDoc?.job_department || "",
        job_role: JobRole || "",
        job_role_name: jobRoleDoc?.job_role || "",
        job_type: DesiredJob || "",
        employment_type: DesiredEmployment || "",
        work_location: locationIds,
        work_location_name: locationNames,
        currency_type: expectedSalary?.currency || "",
        expected_salary: expectedSalary?.salary || 0,
        shift: PreferredShift || "",
      },
    });
  } catch (error) {
    console.error("Error fetching Career Profile:", error.message);
    return res.status(500).json({
      message: "Error fetching Career Profile",
      error: error.message,
      success: false,
    });
  }
};

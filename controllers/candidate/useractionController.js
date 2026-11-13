import User from "../../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import PersonalDetails from "../../models/personalDetails.js";
import CandidateDetails from "../../models/CandidateDetailsModel.js";
import Employment from "../../models/Employment.js";
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
import list_notice from "../../models/monogo_query/noticeModel.js";
import list_university_univercities from "../../models/monogo_query/universityUniversityModel.js";
import list_education_boards from "../../models/monogo_query/educationBoardModel.js";
import list_university_colleges from "../../models/monogo_query/universityCollegesModel.js";
import list_university_course from "../../models/monogo_query/universityCourseModel.js";
import list_school_list from "../../models/monogo_query/schoolListModel.js";
import CompanyDetails from "../../models/company_Models/companydetails.js";
import list_education_level from "../../models/monogo_query/educationLevelModel.js";
import list_university_state from "../../models/monogo_query/universityStateModel.js";
import list_course_type from "../../models/monogo_query/courseTypeModel.js";
import list_grading_system from "../../models/monogo_query/gradingSystemModel.js";
import list_medium_of_education from "../../models/monogo_query/mediumOfEducationModel.js";
import JobApplication from "../../models/jobApplicationModel.js";
import Job from "../../models/company_Models/JobPostingModel.js";

import { emailQueue } from "../../queues/emailQueue.js";
import { apiResponse } from "../../utility/apiResponse.js";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
            },
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
        `e2score/profile_picture/${oldPublicId}`,
      );
    }

    // Update the user's profile with the new picture URL
    const updatedUser = await User.findByIdAndUpdate(
      user_id,
      { profilePicture: profilePictureUrl },
      { new: true },
    );
    if (user) {
      await emailQueue.add("profile_picture_updated", {
        to: user.email,
        user: {
          name: user.name,
        },
      });
    }

    res.status(200).json({
      message: "Profile picture updated successfully",
      profilePicture: profilePictureUrl,
    });
  } catch (error) {
    console.error("Error adding profile picture:", error);
    res.status(500).json({ message: "Error adding profile picture" });
  }
};

// Add Resume Headline add test comand new
export const addResumeHeadline = async (req, res) => {
  try {
    const { resumeHeadline } = req.body;
    const user = req.userId;
    if (!user || !resumeHeadline) {
      return res.status(400).json({ message: "ResumeHeadline are required." });
    }

    const userdtl = await User.findById(user);
    if (!userdtl) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's profile with the new picture URL
    const updated = await PersonalDetails.findOneAndUpdate(
      { user: user },
      { resumeHeadline: resumeHeadline },
      { new: true, upsert: true },
    );

    if (userdtl) {
      await emailQueue.add("resume_headline_updated", {
        to: userdtl.email,
        userdtl: {
          name: userdtl.name,
        },
      });
    }

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
      { $unset: { profileSummary: "" } },
    );

    const userdtl = await User.findById(userId);
    if (userdtl) {
      await emailQueue.add("profile_summary_deleted", {
        to: userdtl.email,
        userdtl: {
          name: userdtl.name,
        },
      });
    }

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

export const updateUserDetails = async (req, res) => {
  try {
    const user_id = req.userId;

    // Fetch old user data
    const oldUser = await User.findById(user_id).lean();
    if (!oldUser) return res.status(404).json({ message: "User not found" });

    // Fetch old candidate details
    const oldDetails = await CandidateDetails.findOne({
      userId: user_id,
    }).lean();

    // Request body
    const {
      full_name,
      gender,
      dob,
      country,
      currentLocation,
      hometown,
      father_name,
      mother_name,
      salary,
      currency,
      experience_years,
      experience_months,
    } = req.body;

    // Prepare new data
    const newUserData = {
      name: full_name,
      gender: gender,
    };

    const newDetailsData = {
      dob,
      country_id: country,
      currentLocation,
      hometown,
      fatherName: father_name,
      motherName: mother_name,
      currentSalary: { currency, salary },
      totalExperience: { year: experience_years, month: experience_months },
    };

    let changeListHTML = "";

    if (oldUser.name != newUserData.name) {
      changeListHTML += `<li><strong>Name</strong></li>`;
    }

    if (oldUser.gender != newUserData.gender) {
      changeListHTML += `<li><strong>Gender</strong></li>`;
    }
    /*  if (oldDetails) { */
    // DOB comparison (safe)
    const oldDobTime = oldDetails?.dob
      ? new Date(oldDetails.dob).getTime()
      : null;

    const newDobTime = dob ? new Date(dob).getTime() : null;

    if (oldDobTime !== newDobTime) {
      changeListHTML += `<li><strong>Date of Birth</strong></li>`;
    }

    // Basic fields
    if ((oldDetails?.country_id ?? null) !== newDetailsData.country_id) {
      changeListHTML += `<li><strong>Country</strong></li>`;
    }

    if (
      (oldDetails?.currentLocation ?? null) !== newDetailsData.currentLocation
    ) {
      changeListHTML += `<li><strong>Current Location</strong></li>`;
    }

    if ((oldDetails?.hometown ?? null) !== newDetailsData.hometown) {
      changeListHTML += `<li><strong>Hometown</strong></li>`;
    }

    if ((oldDetails?.fatherName ?? null) !== newDetailsData.fatherName) {
      changeListHTML += `<li><strong>Father Name</strong></li>`;
    }

    if ((oldDetails?.motherName ?? null) !== newDetailsData.motherName) {
      changeListHTML += `<li><strong>Mother Name</strong></li>`;
    }

    // Current Salary (nested-safe)
    if (
      (oldDetails?.currentSalary?.currency ?? null) !==
      newDetailsData?.currentSalary?.currency
    ) {
      changeListHTML += `<li><strong>Current Salary Currency</strong></li>`;
    }

    if (
      (oldDetails?.currentSalary?.salary ?? null) !==
      newDetailsData?.currentSalary?.salary
    ) {
      changeListHTML += `<li><strong>Current Salary</strong></li>`;
    }

    // Total Experience (nested-safe)
    if (
      (oldDetails?.totalExperience?.year ?? null) !==
      newDetailsData?.totalExperience?.year
    ) {
      changeListHTML += `<li><strong>Total Experience Years</strong></li>`;
    }

    if (
      (oldDetails?.totalExperience?.month ?? null) !==
      newDetailsData?.totalExperience?.month
    ) {
      changeListHTML += `<li><strong>Total Experience Months</strong></li>`;
    }

    /*  } */

    //tittle case for name
    if (newUserData.name) {
      newUserData.name = newUserData.name
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    // Update user
    await User.findByIdAndUpdate(user_id, {
      ...newUserData,
      updatedAt: new Date(),
    });

    // Update details
    await CandidateDetails.findOneAndUpdate(
      { userId: user_id },
      { ...newDetailsData, updatedAt: new Date() },
      { new: true, upsert: true },
    );

    // ---------- SEND EMAIL IF CHANGES EXIST ----------
    if (changeListHTML) {
      /*  const changeListHTML = allChanges
        .map(
          (c) =>
            `<li><strong>${c.field}</strong>: <span style="color:#d9534f">${c.oldValue}</span> → <span style="color:#5cb85c">${c.newValue}</span></li>`
        )
        .join(""); */

      try {
        await emailQueue.add("profile_updated", {
          to: oldUser.email,
          user: {
            name: oldUser.name,
          },
          changeListHTML: changeListHTML,
        });
      } catch (emailError) {
        console.error("Queueing email failed:", emailError);
      }
    }

    // ---------- RESPONSE ----------
    res.status(200).json({
      success: true,
      message: "User details updated",
      // changedFields: allChanges,
    });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({
      message: "Error updating user details",
      error: error.message,
    });
  }
};

// Add Profile Summary
export const addProfileSummary = async (req, res) => {
  try {
    const { profileSummary } = req.body;
    const user = req.userId;

    if (!user || !profileSummary) {
      return res.status(400).json({ message: "Profile Summary is required." });
    }
    const userdtl = await User.findById(user);
    if (!userdtl) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's profile with the new picture URL
    const updated = await PersonalDetails.findOneAndUpdate(
      { user: user },
      { profileSummary: profileSummary },
      { new: true, upsert: true },
    );

    if (userdtl) {
      await emailQueue.add("profile_summary_updated", {
        to: userdtl.email,
        userdtl: {
          name: userdtl.name,
        },
      });
    }

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
      skills,
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
      { upsert: true, new: true },
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
      return res.status(400).json({
        success: false,
        message: "User ID is missing.",
      });
    }

    const userdtl = await User.findById(user).select("name email").lean();

    if (!userdtl) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Handle form-data JSON string
    let parsedSkills = skills;

    if (typeof parsedSkills === "string") {
      try {
        parsedSkills = JSON.parse(parsedSkills);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid skills format.",
        });
      }
    }

    if (!Array.isArray(parsedSkills) || parsedSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Skills must be a non-empty array.",
      });
    }

    if (!parsedSkills.every((skill) => typeof skill === "string")) {
      return res.status(400).json({
        success: false,
        message: "All skills must be strings.",
      });
    }

    // Normalize & remove duplicates
    parsedSkills = [
      ...new Set(parsedSkills.map((skill) => skill.trim().toLowerCase())),
    ];

    // Escape regex characters
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const regexArray = parsedSkills.map(
      (skill) => new RegExp(`^${escapeRegex(skill)}$`, "i"),
    );

    const matchedSkills = await list_key_skill
      .find(
        {
          Skill: { $in: regexArray },
          is_del: 0,
          is_active: 1,
        },
        "_id Skill",
      )
      .lean();

    // Build lookup map using lowercase keys
    const skillMap = {};

    matchedSkills.forEach((row) => {
      skillMap[row.Skill.trim().toLowerCase()] = row._id;
    });

    const missingSkills = parsedSkills.filter((skill) => !skillMap[skill]);

    if (missingSkills.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some skills were not found in the database.",
        missingSkills,
      });
    }

    const skillObjectIds = parsedSkills.map((skill) => skillMap[skill]);

    await PersonalDetails.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(user) },
      {
        $set: {
          skills: skillObjectIds,
        },
        $setOnInsert: {
          user: new mongoose.Types.ObjectId(user),
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    try {
      await emailQueue.add("keyskills_updated", {
        to: userdtl.email,
        userdtl: {
          name: userdtl.name,
        },
      });
    } catch (emailError) {
      console.error("Queueing email failed:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Skills saved successfully.",
      data: skillObjectIds,
    });
  } catch (error) {
    console.error("Error saving skills:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

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
      { headers: form.getHeaders() },
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
    [value.trim()],
  );
  if (existingRows.length > 0) {
    return existingRows[0].id;
  }
  // If not found, insert new row
  const [insertResult] = await db_sql.execute(
    `INSERT INTO ${tableName} (${columnName}, is_active, is_del, flag) VALUES (?, 0, 0, 1)`,
    [trimmedValue],
  );
  return insertResult.insertId;
}

async function getOrInsertId(
  model,
  fieldName,
  value,
  additionalFieldName = null,
  additionalFieldValue = null,
) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  const escapedValue = trimmedValue.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const filter = {
    [fieldName]: { $regex: new RegExp(`^${escapedValue}$`, "i") },
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
    const levelId = String(data.level || "");
    const currentYear = new Date().getFullYear();

    // 1. Verify User existence
    const userdtl = await User.findById(user);
    if (!userdtl) {
      return res.status(404).json({ message: "User not found." });
    }

    // -------------------------------------------------------------
    // 2. INPUT & TIMELINE VALIDATIONS
    // -------------------------------------------------------------

    // --- A. 10th & 12th Grade Validations (Levels 1 & 2) ---
    if (levelId === "1" || levelId === "2") {
      // Board and passing year are required
      if (!data.board || !data.year_of_passing) {
        return res.status(400).json({
          message: "Board and Year of Passing are required.",
        });
      }

      // For 12th (level 2), english and math marks are also required
      if (levelId === "2") {
        if (
          data.eng_marks === undefined ||
          data.eng_marks === null ||
          data.eng_marks === "" ||
          data.math_marks === undefined ||
          data.math_marks === null ||
          data.math_marks === ""
        ) {
          return res.status(400).json({
            message:
              "English marks and Math marks are required for 12th grade.",
          });
        }

        const engNum = Number(data.eng_marks);
        const mathNum = Number(data.math_marks);

        if (isNaN(engNum) || engNum < 0 || engNum > 100) {
          return res.status(400).json({
            message: "English marks must be a number between 0 and 100.",
          });
        }
        if (isNaN(mathNum) || mathNum < 0 || mathNum > 100) {
          return res.status(400).json({
            message: "Math marks must be a number between 0 and 100.",
          });
        }
      }

      const passingYear = Number(data.year_of_passing);
      if (
        isNaN(passingYear) ||
        passingYear < 1950 ||
        passingYear > currentYear
      ) {
        return res.status(400).json({
          message: `Passing year must be a valid year between 1950 and ${currentYear}.`,
        });
      }

      // Gap Validation: Submitting 12th Grade
      if (levelId === "2") {
        const tenthRecord = await UserEducation.findOne({
          userId: user,
          level: "1",
          isDel: false,
        });

        if (tenthRecord?.year_of_passing) {
          const tenthYear = Number(tenthRecord.year_of_passing);
          if (passingYear < tenthYear) {
            return res.status(400).json({
              message: `12th passing year (${passingYear}) cannot be earlier than 10th passing year (${tenthYear}).`,
            });
          }
          if (passingYear - tenthYear < 2) {
            return res.status(400).json({
              message: `12th passing year (${passingYear}) must be at least 2 years after 10th passing year (${tenthYear}).`,
            });
          }
        }
      }
      // Gap Validation: Submitting 10th Grade
      else if (levelId === "1") {
        const twelfthRecord = await UserEducation.findOne({
          userId: user,
          level: "2",
          isDel: false,
        });

        if (twelfthRecord?.year_of_passing) {
          const twelfthYear = Number(twelfthRecord.year_of_passing);
          if (passingYear > twelfthYear) {
            return res.status(400).json({
              message: `10th passing year (${passingYear}) cannot be after 12th passing year (${twelfthYear}).`,
            });
          }
          if (twelfthYear - passingYear < 2) {
            return res.status(400).json({
              message: `10th passing year (${passingYear}) must be at least 2 years prior to 12th passing year (${twelfthYear}).`,
            });
          }
        }
      }
    }
    // --- B. Higher Education Validations (Diploma, UG, PG, PhD) ---
    else {
      if (
        !data.university ||
        !data.institute_name ||
        !data.course_name ||
        !data.start_year ||
        !data.end_year
      ) {
        return res.status(400).json({
          message:
            "University, Institute Name, Course Name, Start Year, and End Year are required.",
        });
      }

      const startYear = Number(data.start_year);
      const endYear = Number(data.end_year);

      if (isNaN(startYear) || isNaN(endYear)) {
        return res
          .status(400)
          .json({ message: "Start and End years must be valid numbers." });
      }

      if (startYear < 1950 || startYear > currentYear + 6) {
        return res.status(400).json({ message: "Invalid start year." });
      }

      if (endYear < startYear) {
        return res.status(400).json({
          message: "End year cannot be earlier than start year.",
        });
      }

      // Check college start year against 12th passing year if available
      const twelfthRecord = await UserEducation.findOne({
        userId: user,
        level: "2",
        isDel: false,
      });

      if (twelfthRecord?.year_of_passing) {
        const twelfthYear = Number(twelfthRecord.year_of_passing);
        if (startYear < twelfthYear) {
          return res.status(400).json({
            message: `College start year (${startYear}) cannot be earlier than 12th passing year (${twelfthYear}).`,
          });
        }
      }
    }

    // --- C. Marks Percentage Range Validation ---
    if (data.marks !== undefined && data.marks !== null && data.marks !== "") {
      const marksNum = Number(data.marks);
      if (isNaN(marksNum) || marksNum < 0 || marksNum > 100) {
        return res.status(400).json({
          message: "Marks percentage must be a number between 0 and 100.",
        });
      }
    }

    // -------------------------------------------------------------
    // 3. FILE UPLOADS & PRIMARY FLAG HANDLING
    // -------------------------------------------------------------
    const transcript = req.files?.transcript?.[0];
    const certificate = req.files?.certificate?.[0];

    let transcriptUrl = null;
    let certificateUrl = null;

    if (transcript) {
      transcriptUrl = await uploadFileToExternalServer(transcript);
    }
    if (certificate) {
      certificateUrl = await uploadFileToExternalServer(certificate);
    }

    // Standardize boolean type conversion for primary flag
    const isPrimary = data.is_primary === "true" || data.is_primary === true;

    if (isPrimary) {
      await UserEducation.updateMany(
        { userId: user, isPrimary: true, isDel: false },
        { $set: { isPrimary: false } },
      );
    }

    // -------------------------------------------------------------
    // 4. DATABASE WRITE OPERATONS
    // -------------------------------------------------------------
    let savedRecord;

    if (levelId === "1" || levelId === "2") {
      const boardId = await getOrInsertId(
        list_education_boards,
        "board_name",
        data.board,
      );
      const schoolId = await getOrInsertId(
        list_school_list,
        "school_name",
        data.school_name,
        "board_id",
        boardId,
      );

      const educationData = {
        userId: user,
        level: levelId,
        state: data.state,
        board: boardId || null,
        school_name: schoolId || null,
        year_of_passing: Number(data.year_of_passing),
        medium_of_education: data.medium,
        marks: data.marks,
        eng_marks: data.eng_marks,
        math_marks: data.math_marks,
        transcript_data: transcriptUrl || null,
        certificate_data: certificateUrl || null,
        isPrimary: isPrimary, // Fixed bug: uses parsed boolean variable
        isDel: false,
      };

      // Upsert logic for 10th / 12th
      const existing = await UserEducation.findOne({
        userId: user,
        level: levelId,
        isDel: false,
      });

      if (existing) {
        savedRecord = await UserEducation.findByIdAndUpdate(
          existing._id,
          educationData,
          { new: true },
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
        isPrimary: isPrimary, // Fixed bug: uses parsed boolean variable
        isDel: false,
      };

      const newRecord = new UserEducation(educationData);
      savedRecord = await newRecord.save();
    }

    // -------------------------------------------------------------
    // 5. EMAIL NOTIFICATIONS (SAFE & NON-BLOCKING)
    // -------------------------------------------------------------
    try {
      await emailQueue.add("education_added", {
        to: userdtl?.email,
        userdtl: {
          name: userdtl?.name,
        },
        instituteName: data?.institute_name,
      });
    } catch (emailError) {
      console.error(
        "Queueing email notification failed (record was saved successfully):",
        emailError,
      );
    }

    return res.status(201).json({
      message: `Education ${
        levelId === "1" || levelId === "2" ? "saved/updated" : "saved"
      } successfully`,
      data: savedRecord,
    });
  } catch (error) {
    console.error("Error in submitUserEducation:", error);
    return res.status(500).json({
      message: "Error saving User Education",
      error: error.message,
    });
  }
};

export const updateUserEducation = async (req, res) => {
  try {
    const data = req.body;
    const user = req.userId;
    const levelId = String(data.level || "");
    const edit_id = req.body._id;
    const currentYear = new Date().getFullYear();

    // 1. Check if edit_id is provided
    if (!edit_id) {
      return res.status(400).json({ message: "Education id is required." });
    }

    // 2. Verify user exists
    const userdtl = await User.findById(user);
    if (!userdtl) {
      return res.status(404).json({ message: "User not found." });
    }

    // 3. Verify target record exists and belongs to user
    const existingRecord = await UserEducation.findOne({
      _id: edit_id,
      userId: user,
      isDel: false,
    });

    if (!existingRecord) {
      return res
        .status(404)
        .json({ message: "Education record not found or not authorized." });
    }

    // -------------------------------------------------------------
    // 4. ALL DOMAIN & TIMELINE VALIDATIONS
    // -------------------------------------------------------------

    // --- A. 10th & 12th Grade Validations (Levels 1 & 2) ---
    if (levelId === "1" || levelId === "2") {
      // Required fields check
      if (!data.board || !data.year_of_passing) {
        return res.status(400).json({
          message: "Board and Year of Passing are required.",
        });
      }

      // For 12th (level 2), english and math marks are also required
      if (levelId === "2") {
        if (
          data.eng_marks === undefined ||
          data.eng_marks === null ||
          data.eng_marks === "" ||
          data.math_marks === undefined ||
          data.math_marks === null ||
          data.math_marks === ""
        ) {
          return res.status(400).json({
            message:
              "English marks and Math marks are required for 12th grade.",
          });
        }

        const engNum = Number(data.eng_marks);
        const mathNum = Number(data.math_marks);

        if (isNaN(engNum) || engNum < 0 || engNum > 100) {
          return res.status(400).json({
            message: "English marks must be a number between 0 and 100.",
          });
        }
        if (isNaN(mathNum) || mathNum < 0 || mathNum > 100) {
          return res.status(400).json({
            message: "Math marks must be a number between 0 and 100.",
          });
        }
      }

      const passingYear = Number(data.year_of_passing);
      if (
        isNaN(passingYear) ||
        passingYear < 1950 ||
        passingYear > currentYear
      ) {
        return res.status(400).json({
          message: `Passing year must be between 1950 and ${currentYear}.`,
        });
      }

      // Gap Validation: Updating 12th Grade
      if (levelId === "2") {
        const tenthRecord = await UserEducation.findOne({
          userId: user,
          level: "1",
          isDel: false,
          _id: { $ne: edit_id }, // Exclude current record being edited
        });

        if (tenthRecord?.year_of_passing) {
          const tenthYear = Number(tenthRecord.year_of_passing);
          if (passingYear < tenthYear) {
            return res.status(400).json({
              message: `12th passing year (${passingYear}) cannot be earlier than 10th passing year (${tenthYear}).`,
            });
          }
          if (passingYear - tenthYear < 2) {
            return res.status(400).json({
              message: `12th passing year (${passingYear}) must be at least 2 years after 10th passing year (${tenthYear}).`,
            });
          }
        }
      }
      // Gap Validation: Updating 10th Grade
      else if (levelId === "1") {
        const twelfthRecord = await UserEducation.findOne({
          userId: user,
          level: "2",
          isDel: false,
          _id: { $ne: edit_id }, // Exclude current record being edited
        });

        if (twelfthRecord?.year_of_passing) {
          const twelfthYear = Number(twelfthRecord.year_of_passing);
          if (passingYear > twelfthYear) {
            return res.status(400).json({
              message: `10th passing year (${passingYear}) cannot be after 12th passing year (${twelfthYear}).`,
            });
          }
          if (twelfthYear - passingYear < 2) {
            return res.status(400).json({
              message: `10th passing year (${passingYear}) must be at least 2 years prior to 12th passing year (${twelfthYear}).`,
            });
          }
        }
      }
    }
    // --- B. Higher Education Validations (Diploma, UG, PG, PhD) ---
    else {
      // Required fields check
      if (
        !data.university ||
        !data.institute_name ||
        !data.course_name ||
        !data.start_year ||
        !data.end_year
      ) {
        return res.status(400).json({
          message:
            "University, Institute, Course, Start Year, and End Year are required.",
        });
      }

      const startYear = Number(data.start_year);
      const endYear = Number(data.end_year);

      if (isNaN(startYear) || isNaN(endYear)) {
        return res
          .status(400)
          .json({ message: "Start and End years must be valid numbers." });
      }

      if (startYear < 1950 || startYear > currentYear + 6) {
        return res.status(400).json({ message: "Invalid start year." });
      }

      if (endYear < startYear) {
        return res.status(400).json({
          message: "End year cannot be earlier than start year.",
        });
      }

      // College Start Year vs 12th Passing Year Validation
      const twelfthRecord = await UserEducation.findOne({
        userId: user,
        level: "2",
        isDel: false,
        _id: { $ne: edit_id },
      });

      if (twelfthRecord?.year_of_passing) {
        const twelfthYear = Number(twelfthRecord.year_of_passing);
        if (startYear < twelfthYear) {
          return res.status(400).json({
            message: `College start year (${startYear}) cannot be earlier than 12th passing year (${twelfthYear}).`,
          });
        }
      }
    }

    // --- C. Marks Percentage Validation ---
    if (data.marks !== undefined && data.marks !== null && data.marks !== "") {
      const marksNum = Number(data.marks);
      if (isNaN(marksNum) || marksNum < 0 || marksNum > 100) {
        return res
          .status(400)
          .json({ message: "Marks percentage must be between 0 and 100." });
      }
    }

    // -------------------------------------------------------------
    // 5. FILE UPLOADS & DATA PREPARATION
    // -------------------------------------------------------------
    const transcript = req.files?.transcript?.[0];
    const certificate = req.files?.certificate?.[0];

    const transcriptUrl = transcript
      ? await uploadFileToExternalServer(transcript)
      : existingRecord.transcript_data;

    const certificateUrl = certificate
      ? await uploadFileToExternalServer(certificate)
      : existingRecord.certificate_data;

    // Standardize boolean type conversion for primary flag
    const isPrimary = data.is_primary === "true" || data.is_primary === true;

    if (isPrimary) {
      await UserEducation.updateMany(
        { userId: user, isPrimary: true, isDel: false },
        { $set: { isPrimary: false } },
      );
    }

    // -------------------------------------------------------------
    // 6. DATABASE UPDATE LOGIC
    // -------------------------------------------------------------
    let savedRecord;

    if (levelId === "1" || levelId === "2") {
      const boardId = await getOrInsertId(
        list_education_boards,
        "board_name",
        data.board,
      );
      const schoolId = await getOrInsertId(
        list_school_list,
        "school_name",
        data.school_name,
        "board_id",
        boardId,
      );

      const educationData = {
        userId: user,
        level: levelId,
        state: data.state,
        board: boardId || null,
        school_name: schoolId || null,
        year_of_passing: Number(data.year_of_passing),
        medium_of_education: data.medium,
        marks: data.marks,
        eng_marks: data.eng_marks,
        math_marks: data.math_marks,
        transcript_data: transcriptUrl,
        certificate_data: certificateUrl,
        isPrimary: isPrimary, // Fixed bug: uses parsed boolean variable
        isDel: false,
      };

      savedRecord = await UserEducation.findByIdAndUpdate(
        edit_id,
        educationData,
        { new: true },
      );
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
        isPrimary: isPrimary, // Fixed bug: uses parsed boolean variable
        isDel: false,
      };

      savedRecord = await UserEducation.findByIdAndUpdate(
        edit_id,
        educationData,
        { new: true },
      );
    }

    // -------------------------------------------------------------
    // 7. EMAIL NOTIFICATION (SAFE & NON-BLOCKING)
    // -------------------------------------------------------------
    try {
      if (userdtl?.email) {
        await emailQueue.add("education_updated", {
          to: userdtl.email,
          userdtl: {
            name: userdtl.name,
          },
        });
      }
    } catch (emailError) {
      console.error(
        "Queueing email notification failed (record updated successfully):",
        emailError,
      );
    }

    return res.status(200).json({
      message: "Education updated successfully",
      data: savedRecord,
    });
  } catch (error) {
    console.error("Error in updateUserEducation:", error);
    return res.status(500).json({
      message: "Error updating User Education",
      error: error.message,
    });
  }
};

export const deleteUserEducation = async (req, res) => {
  try {
    const userId = req.userId;
    const educationId = req.query._id;

    if (!educationId) {
      return res.status(400).json({
        message: "Missing _id (education record ID) in query parameters",
      });
    }

    const userdtl = await User.findById(userId);

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

    if (userdtl) {
      await emailQueue.add("education_deleted", {
        to: userdtl.email,
        userdtl: {
          name: userdtl.name,
        },
      });
    }

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
    const user = await User.findById(userId);

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
    let htmllist = "";

    if (existing) {
      console.log("Updating existing career profile");

      if (dataToSave.CurrentIndustry != existing.CurrentIndustry) {
        htmllist += "<li>Current Industry</li>";
      }
      if (dataToSave.CurrentDepartment != existing.CurrentDepartment) {
        htmllist += "<li>Current Department</li>";
      }
      if (dataToSave.JobRole != existing.JobRole) {
        htmllist += "<li>Job Role</li>";
      }
      if (dataToSave.DesiredJob != existing.DesiredJob) {
        htmllist += "<li>Desired Job</li>";
      }
      if (dataToSave.DesiredEmployment != existing.DesiredEmployment) {
        htmllist += "<li>Desired Employment</li>";
      }
      if (
        JSON.stringify(dataToSave.location) !==
        JSON.stringify(existing.location)
      ) {
        htmllist += "<li>Location</li>";
      }
      if (
        dataToSave.expectedSalary.salary != existing.expectedSalary.salary ||
        dataToSave.expectedSalary.currency != existing.expectedSalary.currency
      ) {
        htmllist += "<li>Expected Salary</li>";
      }
      if (dataToSave.PreferredShift != existing.PreferredShift) {
        htmllist += "<li>Preferred Shift</li>";
      }

      const updated = await UserCareer.findOneAndUpdate(
        { userId },
        dataToSave,
        { new: true },
      );

      if (htmllist) {
        try {
          await emailQueue.add("career_profile_updated", {
            to: user.email,
            user: {
              name: user.name,
            },
            htmllist: htmllist,
          });
        } catch (emailError) {
          console.error("Queueing email failed:", emailError);
        }
      }
      return res.status(200).json({
        message: "Career profile updated successfully",
        data: updated,
        success: true,
      });
    } else {
      console.log("Creating new career profile");

      const newCareer = new UserCareer({
        userId,
        ...dataToSave,
      });

      await newCareer.save();

      try {
        await emailQueue.add("career_profile_added", {
          to: user.email,
          user: {
            name: user.name,
          },
        });
      } catch (emailError) {
        console.error("Queueing email failed:", emailError);
      }

      res.status(200).json({
        message: "Career profile saved successfully",
        data: newCareer,
        success: true,
      });
    }
  } catch (error) {
    console.error("Error saving Career Profile:", error.message);
    res.status(500).json({
      message: "Error saving Career Profile",
      error: error.message,
    });
  }
};

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
              [CurrentDepartment],
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
              locationIds,
            )
          : Promise.resolve([[]]),
      ]);

    const industryName = industryResult[0][0]?.job_industry || "";
    const departmentName = departmentResult[0][0]?.job_department || "";
    const jobRoleName = jobRoleResult[0][0]?.job_role || "";
    const locationMap = new Map(
      locationResult[0].map((row) => [row.id, row.city_name]),
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
    const userId = req.query.Id || req.userId;

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
              .find({ id: { $in: locationIds } })
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

export const comparativeStudy = async (req, res) => {
  try {
    const userId = req.query.Id || req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    const [user, candidateDetails, education, careerProfile, lastEmployment] =
      await Promise.all([
        User.findById(userId).select("name").lean(),
        CandidateDetails.findOne({ userId })
          .select("dob currentSalary totalExperience")
          .lean(),
        UserEducation.findOne({ userId, isDel: false })
          .sort({ createdAt: -1 })
          .lean(),
        UserCareer.findOne({ userId, isDel: false })
          .select("expectedSalary")
          .lean(),
        Employment.findOne({
          user: userId,
          isDel: false,
          $or: [
            { workedInCompany: { $exists: false } },
            { workedInCompany: true },
          ],
        })
          .sort({
            "joiningDate.year": -1,
            "joiningDate.month": -1,
            createdAt: -1,
          })
          .select("NoticePeriod")
          .lean(),
      ]);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Get education lookup details
    const [
      level,
      state,
      university,
      institute,
      course,
      courseType,
      gradingSystem,
      medium,
      board,
      school,
    ] = await Promise.all([
      education?.level
        ? list_education_level
            .findOne({ id: education.level }, { id: 1, level: 1, _id: 0 })
            .lean()
        : null,

      education?.state
        ? list_university_state
            .findOne({ id: education.state })
            .select("id name -_id")
            .lean()
        : null,

      education?.universityName
        ? list_university_univercities
            .findOne({ id: education.universityName })
            .select("id name -_id")
            .lean()
        : null,

      education?.instituteName
        ? list_university_colleges
            .findOne({ id: education.instituteName })
            .select("id name -_id")
            .lean()
        : null,

      education?.courseName
        ? list_university_course
            .findOne({ id: education.courseName })
            .select("id name -_id")
            .lean()
        : null,

      education?.courseType
        ? list_course_type
            .findOne({ id: education.courseType })
            .select("id name -_id")
            .lean()
        : null,

      education?.gradingSystem
        ? list_grading_system
            .findOne({ id: education.gradingSystem })
            .select("id name -_id")
            .lean()
        : null,

      education?.medium_of_education
        ? list_medium_of_education
            .findOne({ id: education.medium_of_education })
            .select("id name -_id")
            .lean()
        : null,

      education?.board
        ? list_education_boards
            .findOne({ id: education.board })
            .select("id board_name -_id")
            .lean()
        : null,

      education?.school_name
        ? list_school_list
            .findOne({ id: education.school_name })
            .select("id school_name -_id")
            .lean()
        : null,
    ]);

    const noticePeriod = lastEmployment?.NoticePeriod
      ? await list_notice
          .findOne({
            id: lastEmployment.NoticePeriod,
            is_del: 0,
            is_active: 1,
          })
          .select("name")
          .lean()
      : null;
    return res.status(200).json({
      message: "Comparative study details fetched successfully",
      success: true,
      data: {
        name: user.name || "",
        date_of_birth: candidateDetails?.dob || null,

        total_experience: {
          year: candidateDetails?.totalExperience?.year || "",
          month: candidateDetails?.totalExperience?.month || "",
        },

        last_qualification: {
          ...education,
          level: level?.level || education?.level || "",
          level_id: education?.level || "",
          course_name: course?.name || education?.courseName || "",
          year_of_passing: education?.year_of_passing || "",
          state: state?.name || education?.state || "",
          universityName: university?.name || education?.universityName || "",
          instituteName: institute?.name || education?.instituteName || "",
          courseType: courseType?.name || education?.courseType || "",
          gradingSystem: gradingSystem?.name || education?.gradingSystem || "",
          medium_of_education:
            medium?.name || education?.medium_of_education || "",
          board: board?.board_name || education?.board || "",
          school_name: school?.school_name || education?.school_name || "",
        },

        current_ctc: {
          currency: candidateDetails?.currentSalary?.currency || "",
          amount: candidateDetails?.currentSalary?.salary ?? 0,
        },

        expected_ctc: {
          currency: careerProfile?.expectedSalary?.currency || "",
          amount: careerProfile?.expectedSalary?.salary ?? 0,
        },

        last_employment_notice_period: noticePeriod?.name || "",
      },
    });
  } catch (error) {
    console.error("Error fetching comparative study details:", error.message);
    return res.status(500).json({
      message: "Error fetching comparative study details",
      error: error.message,
      success: false,
    });
  }
};

/* export const comparativeStudyList = async (req, res) => {
  try {
    const userId = req.userId;

    // Pagination
    const pageValue = Number.parseInt(req.query.page, 10);
    const limitValue = Number.parseInt(req.query.limit, 10);

    const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;

    const limit =
      Number.isInteger(limitValue) && limitValue > 0
        ? Math.min(limitValue, 100)
        : 2;

    // Sorting
    const sortFields = {
      candidateName: "candidateName",
      jobTitle: "jobTitle",
      noticePeriod: "noticePeriod",
      status: "status",
    };

    const requestedSortField =
      typeof req.query.sortBy === "string" ? req.query.sortBy : "";

    const sortField = Object.prototype.hasOwnProperty.call(
      sortFields,
      requestedSortField,
    )
      ? sortFields[requestedSortField]
      : null;

    const sortOrder =
      typeof req.query.sortOrder === "string" &&
      req.query.sortOrder.toLowerCase() === "asc"
        ? 1
        : -1;

    // Search and status
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";

    const status =
      typeof req.query.status === "string" ? req.query.status.trim() : "";

    const searchFilters = {};

    const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    if (status && status.toLowerCase() !== "all") {
      searchFilters.status = status;
    }

    if (search) {
      const searchRegex = {
        $regex: escapeRegex(search),
        $options: "i",
      };

      searchFilters.$or = [
        { candidateName: searchRegex },
        { jobTitle: searchRegex },
        { miscellaneousJobTitle: searchRegex },
      ];
    }

    // 1. Get jobs posted by logged-in user
    const myJobs = await Job.find(
      { userId: userId, is_del: false },
      { _id: 1 },
    );

    if (!myJobs.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        pagination: {
          page,
          limit,
          totalPages: 0,
        },
      });
    }

    const jobIds = myJobs.map((job) => job._id);

    // 2. Get applicants for those jobs
    const appliedCandidates = await JobApplication.aggregate([
      {
        $match: {
          jobId: { $in: jobIds },
          isDel: false,
        },
      },

      // Latest applications first
      {
        $sort: { appliedAt: -1 },
      },

      // 3. User details
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 4. Personal details
      {
        $lookup: {
          from: "personaldetails",
          localField: "userId",
          foreignField: "userId",
          as: "personalDetails",
        },
      },
      {
        $unwind: {
          path: "$personalDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 5. Candidate details
      {
        $lookup: {
          from: "candidatedetails",
          let: {
            candidateUserId: "$userId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$userId", "$$candidateUserId"],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "candidateDetails",
        },
      },
      {
        $unwind: {
          path: "$candidateDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 6. Career profile
      {
        $lookup: {
          from: "usercareers",
          let: {
            candidateUserId: "$userId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$userId", "$$candidateUserId"],
                },
                isDel: false,
              },
            },
            {
              $project: {
                expectedSalary: 1,
                JobRole: 1,
              },
            },
            { $limit: 1 },
          ],
          as: "career",
        },
      },
      {
        $unwind: {
          path: "$career",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 7. Job details
      {
        $lookup: {
          from: "jobpostinglists",
          localField: "jobId",
          foreignField: "_id",
          as: "jobDetails",
        },
      },
      {
        $unwind: {
          path: "$jobDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 8. Convert JobRole string to ObjectId
      {
        $addFields: {
          jobRoleObjectId: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$career.JobRole", null] },
                  { $ne: ["$career.JobRole", ""] },
                ],
              },
              then: {
                $convert: {
                  input: "$career.JobRole",
                  to: "objectId",
                  onError: null,
                  onNull: null,
                },
              },
              else: null,
            },
          },
        },
      },

      // 9. Job role master
      {
        $lookup: {
          from: "list_job_roles",
          localField: "jobRoleObjectId",
          foreignField: "_id",
          as: "jobRoleData",
        },
      },
      {
        $unwind: {
          path: "$jobRoleData",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 10. Interview feedback
      {
        $lookup: {
          from: "interviewfeedbacks",
          localField: "_id",
          foreignField: "applicationId",
          as: "feedback",
        },
      },
      {
        $unwind: {
          path: "$feedback",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 11. Interview invitation status
      {
        $addFields: {
          interviewInvitationStatus: {
            $cond: {
              if: {
                $ne: [
                  {
                    $ifNull: ["$interviewInvitationAccepted", null],
                  },
                  null,
                ],
              },
              then: {
                $cond: {
                  if: {
                    $eq: ["$interviewInvitationAccepted", true],
                  },
                  then: "accepted",
                  else: {
                    $cond: {
                      if: {
                        $eq: ["$interviewInvitationAccepted", false],
                      },
                      then: "rejected",
                      else: "pending",
                    },
                  },
                },
              },
              else: {
                $cond: {
                  if: {
                    $eq: ["$requestReschedule", true],
                  },
                  then: "reschedule_request",
                  else: "pending",
                },
              },
            },
          },
        },
      },

      // 12. Latest education
      {
        $lookup: {
          from: "usereducations",
          let: {
            candidateUserId: "$userId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$userId", "$$candidateUserId"],
                },
                isDel: false,
              },
            },
            {
              $sort: {
                createdAt: -1,
              },
            },
            { $limit: 1 },
          ],
          as: "education",
        },
      },
      {
        $unwind: {
          path: "$education",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 13. Last employment
      {
        $lookup: {
          from: "employments",
          let: {
            candidateUserId: "$userId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$user", "$$candidateUserId"],
                    },
                    {
                      $eq: ["$isDel", false],
                    },
                    {
                      $or: [
                        {
                          $eq: [{ $type: "$workedInCompany" }, "missing"],
                        },
                        {
                          $eq: ["$workedInCompany", true],
                        },
                      ],
                    },
                  ],
                },
              },
            },
            {
              $sort: {
                createdAt: -1,
              },
            },
            { $limit: 1 },
            {
              $project: {
                NoticePeriod: 1,
              },
            },
          ],
          as: "lastEmployment",
        },
      },
      {
        $unwind: {
          path: "$lastEmployment",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 14. Education level master
      // String conversion handles string/number ID differences.
      {
        $lookup: {
          from: "list_education_level",
          let: {
            lookupId: "$education.level",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: "$id" }, "$$lookupId"],
                },
              },
            },
            {
              $project: {
                _id: 0,
                id: 1,
                level: 1,
              },
            },
            { $limit: 1 },
          ],
          as: "educationLevel",
        },
      },
      {
        $unwind: {
          path: "$educationLevel",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 15. University state master
      {
        $lookup: {
          from: "list_university_states",
          let: {
            lookupId: "$education.state",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$lookupId", null] },
                    {
                      $eq: [{ $toString: "$id" }, { $toString: "$$lookupId" }],
                    },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "educationState",
        },
      },
      {
        $unwind: {
          path: "$educationState",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 16. University master
      {
        $lookup: {
          from: "list_university_univercities",
          let: {
            lookupId: "$education.universityName",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$lookupId", null] },
                    {
                      $eq: [{ $toString: "$id" }, { $toString: "$$lookupId" }],
                    },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "university",
        },
      },
      {
        $unwind: {
          path: "$university",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 17. Institute / college master
      {
        $lookup: {
          from: "list_university_colleges",
          let: {
            lookupId: "$education.instituteName",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$lookupId", null] },
                    {
                      $eq: [{ $toString: "$id" }, { $toString: "$$lookupId" }],
                    },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "institute",
        },
      },
      {
        $unwind: {
          path: "$institute",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 18. Course master
      {
        $lookup: {
          from: "list_university_courses",
          let: {
            lookupId: "$education.courseName",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$lookupId", null] },
                    {
                      $eq: [{ $toString: "$id" }, "$$lookupId"],
                    },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "course",
        },
      },
      {
        $unwind: {
          path: "$course",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 19. Course type master
      {
        $lookup: {
          from: "list_course_types",
          let: {
            lookupId: "$education.courseType",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$lookupId", null] },
                    {
                      $eq: [{ $toString: "$id" }, { $toString: "$$lookupId" }],
                    },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "courseType",
        },
      },
      {
        $unwind: {
          path: "$courseType",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 20. Grading system master
      {
        $lookup: {
          from: "list_grading_systems",
          let: {
            lookupId: "$education.gradingSystem",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$lookupId", null] },
                    {
                      $eq: [{ $toString: "$id" }, { $toString: "$$lookupId" }],
                    },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "gradingSystem",
        },
      },
      {
        $unwind: {
          path: "$gradingSystem",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 21. Medium of education master
      {
        $lookup: {
          from: "list_medium_of_educations",
          let: {
            lookupId: "$education.medium_of_education",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$lookupId", null] },
                    {
                      $eq: [{ $toString: "$id" }, { $toString: "$$lookupId" }],
                    },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "medium",
        },
      },
      {
        $unwind: {
          path: "$medium",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 22. Education board master
      {
        $lookup: {
          from: "list_education_boards",
          let: {
            lookupId: "$education.board",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$lookupId", null] },
                    {
                      $eq: [{ $toString: "$id" }, { $toString: "$$lookupId" }],
                    },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "educationBoard",
        },
      },
      {
        $unwind: {
          path: "$educationBoard",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 23. School master
      {
        $lookup: {
          from: "list_school_lists",
          let: {
            lookupId: "$education.school_name",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$lookupId", null] },
                    {
                      $eq: [{ $toString: "$id" }, { $toString: "$$lookupId" }],
                    },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "school",
        },
      },
      {
        $unwind: {
          path: "$school",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 24. Notice period master
      {
        $lookup: {
          from: "list_notices",
          let: {
            noticeId: "$lastEmployment.NoticePeriod",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [{ $toString: "$id" }, { $toString: "$$noticeId" }],
                    },
                  ],
                },
                is_del: 0,
                is_active: 1,
              },
            },
            {
              $project: {
                name: 1,
                _id: 0,
              },
            },
            { $limit: 1 },
          ],
          as: "noticePeriodDetails",
        },
      },
      {
        $unwind: {
          path: "$noticePeriodDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 25. Final response projection
      {
        $project: {
          _id: 1,
          jobId: 1,
          userId: 1,
          status: 1,
          noticePeriod: 1,
          experienceLevel: 1,
          preferredTime: 1,
          availabilityOnSaturday: 1,
          willingToRelocate: 1,
          miscellaneousJobTitle: 1,

          // Candidate information
          name: {
            $ifNull: ["$user.name", ""],
          },
          candidateName: {
            $ifNull: ["$user.name", ""],
          },
          profilePicture: "$user.profilePicture",

          date_of_birth: {
            $ifNull: ["$candidateDetails.dob", null],
          },

          currentLocation: {
            $ifNull: ["$candidateDetails.currentLocation", ""],
          },

          // Total experience
          total_experience: {
            year: {
              $ifNull: ["$candidateDetails.totalExperience.year", ""],
            },
            month: {
              $ifNull: ["$candidateDetails.totalExperience.month", ""],
            },
          },

          // Skills
          skills: {
            $ifNull: ["$personalDetails.skills", []],
          },

          // Job information
          jobRole: "$jobRoleData.job_role",
          jobTitle: "$jobDetails.jobTitle",

          // Current CTC
          current_ctc: {
            currency: {
              $ifNull: ["$candidateDetails.currentSalary.currency", ""],
            },
            amount: {
              $ifNull: ["$candidateDetails.currentSalary.salary", 0],
            },
          },

          // Expected CTC
          expected_ctc: {
            currency: {
              $ifNull: ["$career.expectedSalary.currency", ""],
            },
            amount: {
              $ifNull: ["$career.expectedSalary.salary", 0],
            },
          },

          // Last employment notice period
          last_employment_notice_period: {
            $ifNull: ["$noticePeriodDetails.name", ""],
          },

          // Complete last qualification
          last_qualification: {
            $mergeObjects: [
              {
                $ifNull: ["$education", {}],
              },
              {
                level: {
                  $ifNull: ["$educationLevel.level", ""],
                },

                level_id: {
                  $ifNull: ["$education.level", ""],
                },

                course_name: {
                  $ifNull: ["$course.name", "$education.courseName", ""],
                },

                year_of_passing: {
                  $ifNull: ["$education.year_of_passing", ""],
                },

                state: {
                  $ifNull: ["$educationState.name", "$education.state", ""],
                },

                universityName: {
                  $ifNull: [
                    "$university.name",
                    "$education.universityName",
                    "",
                  ],
                },

                instituteName: {
                  $ifNull: ["$institute.name", "$education.instituteName", ""],
                },

                courseType: {
                  $ifNull: ["$courseType.name", "$education.courseType", ""],
                },

                gradingSystem: {
                  $ifNull: [
                    "$gradingSystem.name",
                    "$education.gradingSystem",
                    "",
                  ],
                },

                medium_of_education: {
                  $ifNull: [
                    "$medium.name",
                    "$education.medium_of_education",
                    "",
                  ],
                },

                board: {
                  $ifNull: [
                    "$educationBoard.board_name",
                    "$education.board",
                    "",
                  ],
                },

                school_name: {
                  $ifNull: [
                    "$school.school_name",
                    "$education.school_name",
                    "",
                  ],
                },
              },
            ],
          },

          // Interview information
          interviewInvitationAccepted: 1,
          isInterviewFeedbackSubmitted: 1,
          interviewInvitationStatus: 1,
          interviewDate: 1,
          interviewTime: 1,
          // Interview feedback
          feedback: {
            communicationSkillScore: "$feedback.communicationSkillScore",
            technicalSkillScore: "$feedback.technicalSkillScore",
            aptitudeScore: "$feedback.aptitudeScore",
            overallScore: "$feedback.overallScore",
            lastDrawnSalary: "$feedback.lastDrawnSalary",
            expectedSalary: "$feedback.expectedSalary",
            message: "$feedback.message",
            createdAt: "$feedback.createdAt",
            appeared: "$feedback.appeared",
          },
        },
      },

      // 26. Search and status filters
      ...(Object.keys(searchFilters).length ? [{ $match: searchFilters }] : []),

      // 27. Sorting
      ...(sortField
        ? [
            {
              $sort: {
                [sortField]: sortOrder,
                _id: -1,
              },
            },
          ]
        : []),

      // 28. Pagination
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
    ]);

    const { metadata = [], data = [] } = appliedCandidates[0] || {};

    const totalCount = metadata[0]?.total || 0;

    console.log("Applicant list response ==>", data);

    return res.status(200).json({
      success: true,
      count: totalCount,
      data,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching applied candidates:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}; */

export const comparativeStudyList = async (req, res) => {
  try {
    const userId = req.userId;

    // Pagination
    const pageValue = Number.parseInt(req.query.page, 10);
    const limitValue = Number.parseInt(req.query.limit, 10);

    const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;

    const limit =
      Number.isInteger(limitValue) && limitValue > 0
        ? Math.min(limitValue, 100)
        : 15;

    // Sorting
    const sortFields = {
      candidateName: "candidateName",
      jobTitle: "jobTitle",
      noticePeriod: "noticePeriod",
      status: "status",
      total_experience: "totalExperienceMonths",
      current_ctc: "currentCtcAmount",
      expected_ctc: "expectedCtcAmount",
    };

    const requestedSortField =
      typeof req.query.sortBy === "string" ? req.query.sortBy : "";

    const sortField = Object.prototype.hasOwnProperty.call(
      sortFields,
      requestedSortField,
    )
      ? sortFields[requestedSortField]
      : null;
    console.log("wwwwwwwwwwwwwwwwwwwww=>", sortField);
    const sortOrder =
      typeof req.query.sortOrder === "string" &&
      req.query.sortOrder.toLowerCase() === "asc"
        ? 1
        : -1;

    // Search and status
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";

    const status =
      typeof req.query.status === "string" ? req.query.status.trim() : "";

    const searchFilters = {};

    const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    if (status && status.toLowerCase() !== "all") {
      searchFilters.status = status;
    }

    if (search) {
      const searchRegex = {
        $regex: escapeRegex(search),
        $options: "i",
      };

      searchFilters.$or = [
        { candidateName: searchRegex },
        { jobTitle: searchRegex },
        { miscellaneousJobTitle: searchRegex },
      ];
    }

    // 1. Get jobs posted by logged-in user
    const myJobs = await Job.find(
      { userId: userId, is_del: false },
      { _id: 1 },
    );

    if (!myJobs.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        pagination: {
          page,
          limit,
          totalPages: 0,
        },
      });
    }

    const jobIds = myJobs.map((job) => job._id);

    // 2. Get applicants for those jobs
    const appliedCandidates = await JobApplication.aggregate([
      {
        $match: {
          jobId: { $in: jobIds },
          isDel: false,
        },
      },

      // Latest applications first
      {
        $sort: { appliedAt: -1 },
      },

      // 3. User details
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 4. Personal details
      {
        $lookup: {
          from: "personaldetails",
          localField: "userId",
          foreignField: "userId",
          as: "personalDetails",
        },
      },
      {
        $unwind: {
          path: "$personalDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 5. Candidate details
      {
        $lookup: {
          from: "candidatedetails",
          let: {
            candidateUserId: "$userId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$userId", "$$candidateUserId"],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "candidateDetails",
        },
      },
      {
        $unwind: {
          path: "$candidateDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 6. Career profile
      {
        $lookup: {
          from: "usercareers",
          let: {
            candidateUserId: "$userId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$userId", "$$candidateUserId"],
                },
                isDel: false,
              },
            },
            {
              $project: {
                expectedSalary: 1,
                JobRole: 1,
              },
            },
            { $limit: 1 },
          ],
          as: "career",
        },
      },
      {
        $unwind: {
          path: "$career",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 7. Job details
      {
        $lookup: {
          from: "jobpostinglists",
          localField: "jobId",
          foreignField: "_id",
          as: "jobDetails",
        },
      },
      {
        $unwind: {
          path: "$jobDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 8. Convert JobRole string to ObjectId
      {
        $addFields: {
          jobRoleObjectId: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$career.JobRole", null] },
                  { $ne: ["$career.JobRole", ""] },
                ],
              },
              then: {
                $convert: {
                  input: "$career.JobRole",
                  to: "objectId",
                  onError: null,
                  onNull: null,
                },
              },
              else: null,
            },
          },
        },
      },

      // 9. Job role master
      {
        $lookup: {
          from: "list_job_roles",
          localField: "jobRoleObjectId",
          foreignField: "_id",
          as: "jobRoleData",
        },
      },
      {
        $unwind: {
          path: "$jobRoleData",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 10. Interview feedback
      {
        $lookup: {
          from: "interviewfeedbacks",
          localField: "_id",
          foreignField: "applicationId",
          as: "feedback",
        },
      },
      {
        $unwind: {
          path: "$feedback",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 11. Interview invitation status
      {
        $addFields: {
          interviewInvitationStatus: {
            $cond: {
              if: {
                $ne: [
                  {
                    $ifNull: ["$interviewInvitationAccepted", null],
                  },
                  null,
                ],
              },
              then: {
                $cond: {
                  if: {
                    $eq: ["$interviewInvitationAccepted", true],
                  },
                  then: "accepted",
                  else: {
                    $cond: {
                      if: {
                        $eq: ["$interviewInvitationAccepted", false],
                      },
                      then: "rejected",
                      else: "pending",
                    },
                  },
                },
              },
              else: {
                $cond: {
                  if: {
                    $eq: ["$requestReschedule", true],
                  },
                  then: "reschedule_request",
                  else: "pending",
                },
              },
            },
          },
        },
      },

      // 12. Latest education
      {
        $lookup: {
          from: "usereducations",
          let: {
            candidateUserId: "$userId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$userId", "$$candidateUserId"],
                },
                isDel: false,
              },
            },
            {
              $sort: {
                createdAt: -1,
              },
            },
            { $limit: 1 },
          ],
          as: "education",
        },
      },
      {
        $unwind: {
          path: "$education",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 13. Last employment
      {
        $lookup: {
          from: "employments",
          let: {
            candidateUserId: "$userId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$user", "$$candidateUserId"],
                    },
                    {
                      $eq: ["$isDel", false],
                    },
                    {
                      $or: [
                        {
                          $eq: [{ $type: "$workedInCompany" }, "missing"],
                        },
                        {
                          $eq: ["$workedInCompany", true],
                        },
                      ],
                    },
                  ],
                },
              },
            },
            {
              $sort: {
                createdAt: -1,
              },
            },
            { $limit: 1 },
            {
              $project: {
                NoticePeriod: 1,
              },
            },
          ],
          as: "lastEmployment",
        },
      },
      {
        $unwind: {
          path: "$lastEmployment",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 14. Education level master
      {
        $lookup: {
          from: "list_education_level",
          let: {
            lookupId: "$education.level",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: "$id" }, "$$lookupId"],
                },
              },
            },
            {
              $project: {
                _id: 0,
                id: 1,
                level: 1,
              },
            },
            { $limit: 1 },
          ],
          as: "educationLevel",
        },
      },
      {
        $unwind: {
          path: "$educationLevel",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 15. University state master
      {
        $lookup: {
          from: "list_university_states",
          let: {
            lookupId: "$education.state",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$lookupId", null] },
                    {
                      $eq: [{ $toString: "$id" }, { $toString: "$$lookupId" }],
                    },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "educationState",
        },
      },
      {
        $unwind: {
          path: "$educationState",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 16. University master
      {
        $lookup: {
          from: "list_university_univercities",
          let: {
            lookupId: "$education.universityName",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$lookupId", null] },
                    {
                      $eq: [{ $toString: "$id" }, { $toString: "$$lookupId" }],
                    },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "university",
        },
      },
      {
        $unwind: {
          path: "$university",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 17. Institute / college master
      {
        $lookup: {
          from: "list_university_colleges",
          let: {
            lookupId: "$education.instituteName",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$lookupId", null] },
                    {
                      $eq: [{ $toString: "$id" }, { $toString: "$$lookupId" }],
                    },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "institute",
        },
      },
      {
        $unwind: {
          path: "$institute",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 18. Course master
      {
        $lookup: {
          from: "list_university_courses",
          let: {
            lookupId: "$education.courseName",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$lookupId", null] },
                    {
                      $eq: [{ $toString: "$id" }, "$$lookupId"],
                    },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "course",
        },
      },
      {
        $unwind: {
          path: "$course",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 19. Course type master
      {
        $lookup: {
          from: "list_course_types",
          let: {
            lookupId: "$education.courseType",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$lookupId", null] },
                    {
                      $eq: [{ $toString: "$id" }, "$$lookupId"],
                    },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "courseType",
        },
      },
      {
        $unwind: {
          path: "$courseType",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 20. Grading system master
      {
        $lookup: {
          from: "list_grading_systems",
          let: {
            lookupId: "$education.gradingSystem",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$lookupId", null] },
                    {
                      $eq: [{ $toString: "$id" }, "$$lookupId"],
                    },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "gradingSystem",
        },
      },
      {
        $unwind: {
          path: "$gradingSystem",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 21. Medium of education master
      {
        $lookup: {
          from: "list_medium_of_educations",
          let: {
            lookupId: "$education.medium_of_education",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$lookupId", null] },
                    {
                      $eq: [{ $toString: "$id" }, "$$lookupId"],
                    },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "medium",
        },
      },
      {
        $unwind: {
          path: "$medium",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 22. Education board master
      {
        $lookup: {
          from: "list_education_boards",
          let: {
            lookupId: "$education.board",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$lookupId", null] },
                    {
                      $eq: [{ $toString: "$id" }, "$$lookupId"],
                    },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "educationBoard",
        },
      },
      {
        $unwind: {
          path: "$educationBoard",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 23. School master
      {
        $lookup: {
          from: "list_school_lists",
          let: {
            lookupId: "$education.school_name",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$lookupId", null] },
                    {
                      $eq: [{ $toString: "$id" }, "$$lookupId"],
                    },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "school",
        },
      },
      {
        $unwind: {
          path: "$school",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 24. Notice period master
      {
        $lookup: {
          from: "list_notices",
          let: {
            noticeId: "$lastEmployment.NoticePeriod",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [{ $toString: "$id" }, { $toString: "$$noticeId" }],
                    },
                  ],
                },
                is_del: 0,
                is_active: 1,
              },
            },
            {
              $project: {
                name: 1,
                _id: 0,
              },
            },
            { $limit: 1 },
          ],
          as: "noticePeriodDetails",
        },
      },
      {
        $unwind: {
          path: "$noticePeriodDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 25. Final response projection
      {
        $project: {
          _id: 1,
          jobId: 1,
          userId: 1,
          status: 1,
          noticePeriod: 1,
          experienceLevel: 1,
          preferredTime: 1,
          availabilityOnSaturday: 1,
          willingToRelocate: 1,
          miscellaneousJobTitle: 1,

          // Candidate information
          name: {
            $ifNull: ["$user.name", ""],
          },
          candidateName: {
            $ifNull: ["$user.name", ""],
          },
          profilePicture: "$user.profilePicture",

          date_of_birth: {
            $ifNull: ["$candidateDetails.dob", null],
          },

          currentLocation: {
            $ifNull: ["$candidateDetails.currentLocation", ""],
          },

          // Total experience
          total_experience: {
            year: {
              $ifNull: ["$candidateDetails.totalExperience.year", ""],
            },
            month: {
              $ifNull: ["$candidateDetails.totalExperience.month", ""],
            },
          },

          // Skills
          skills: {
            $ifNull: ["$personalDetails.skills", []],
          },

          // Job information
          jobRole: "$jobRoleData.job_role",
          jobTitle: "$jobDetails.jobTitle",

          // Current CTC
          current_ctc: {
            currency: {
              $ifNull: ["$candidateDetails.currentSalary.currency", ""],
            },
            amount: {
              $ifNull: ["$candidateDetails.currentSalary.salary", 0],
            },
          },

          // Expected CTC
          expected_ctc: {
            currency: {
              $ifNull: ["$career.expectedSalary.currency", ""],
            },
            amount: {
              $ifNull: ["$career.expectedSalary.salary", 0],
            },
          },

          // Last employment notice period
          last_employment_notice_period: {
            $ifNull: ["$noticePeriodDetails.name", ""],
          },

          // Complete last qualification
          last_qualification: {
            $mergeObjects: [
              {
                $ifNull: ["$education", {}],
              },
              {
                level: {
                  $ifNull: ["$educationLevel.level", ""],
                },

                level_id: {
                  $ifNull: ["$education.level", ""],
                },

                course_name: {
                  $ifNull: ["$course.name", "$education.courseName", ""],
                },

                year_of_passing: {
                  $ifNull: ["$education.year_of_passing", ""],
                },

                state: {
                  $ifNull: ["$educationState.name", "$education.state", ""],
                },

                universityName: {
                  $ifNull: [
                    "$university.name",
                    "$education.universityName",
                    "",
                  ],
                },

                instituteName: {
                  $ifNull: ["$institute.name", "$education.instituteName", ""],
                },

                courseType: {
                  $ifNull: ["$courseType.name", "$education.courseType", ""],
                },

                gradingSystem: {
                  $ifNull: [
                    "$gradingSystem.name",
                    "$education.gradingSystem",
                    "",
                  ],
                },

                medium_of_education: {
                  $ifNull: [
                    "$medium.name",
                    "$education.medium_of_education",
                    "",
                  ],
                },

                board: {
                  $ifNull: [
                    "$educationBoard.board_name",
                    "$education.board",
                    "",
                  ],
                },

                school_name: {
                  $ifNull: [
                    "$school.school_name",
                    "$education.school_name",
                    "",
                  ],
                },
              },
            ],
          },

          // Interview information
          interviewInvitationAccepted: 1,
          isInterviewFeedbackSubmitted: 1,
          interviewInvitationStatus: 1,
          interviewDate: 1,
          interviewTime: 1,

          // Interview feedback
          feedback: {
            communicationSkillScore: "$feedback.communicationSkillScore",
            technicalSkillScore: "$feedback.technicalSkillScore",
            aptitudeScore: "$feedback.aptitudeScore",
            overallScore: "$feedback.overallScore",
            lastDrawnSalary: "$feedback.lastDrawnSalary",
            expectedSalary: "$feedback.expectedSalary",
            message: "$feedback.message",
            createdAt: "$feedback.createdAt",
            appeared: "$feedback.appeared",
          },
        },
      },

      // 26. Search and status filters
      ...(Object.keys(searchFilters).length ? [{ $match: searchFilters }] : []),

      // 27. Prepare numeric values for sorting
      {
        $addFields: {
          // Total experience in months
          totalExperienceMonths: {
            $add: [
              {
                $multiply: [
                  {
                    $convert: {
                      input: "$total_experience.year",
                      to: "double",
                      onError: 0,
                      onNull: 0,
                    },
                  },
                  12,
                ],
              },
              {
                $convert: {
                  input: "$total_experience.month",
                  to: "double",
                  onError: 0,
                  onNull: 0,
                },
              },
            ],
          },

          // Current CTC numeric value
          currentCtcAmount: {
            $convert: {
              input: "$current_ctc.amount",
              to: "double",
              onError: 0,
              onNull: 0,
            },
          },

          // Expected CTC numeric value
          expectedCtcAmount: {
            $convert: {
              input: "$expected_ctc.amount",
              to: "double",
              onError: 0,
              onNull: 0,
            },
          },
        },
      },

      // 28. Sorting
      ...(sortField
        ? [
            {
              $sort: {
                [sortField]: sortOrder,
                _id: -1,
              },
            },
          ]
        : [
            {
              $sort: {
                appliedAt: -1,
                _id: -1,
              },
            },
          ]),

      // 29. Pagination
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $unset: [
                "totalExperienceMonths",
                "currentCtcAmount",
                "expectedCtcAmount",
              ],
            },
          ],
        },
      },
    ]);

    const { metadata = [], data = [] } = appliedCandidates[0] || {};

    const totalCount = metadata[0]?.total || 0;

    console.log("Applicant list response ==>", data);

    return res.status(200).json({
      success: true,
      count: totalCount,
      data,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching applied candidates:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const removeProfilePicture = async (req, res) => {
  const userId = req.userId;

  try {
    const userDetails = await User.findOne({
      _id: userId,
    });

    if (!userDetails) {
      return apiResponse(res, 404, false, "User not found", null, null);
    }

    const profilePicture = userDetails?.profilePicture;
    if (!profilePicture) {
      return apiResponse(
        res,
        400,
        false,
        "No profile picture Uploaded yet",
        null,
        null,
      );
    }

    const publicId = profilePicture?.split("/").pop()?.split(".")[0];
    await cloudinary.uploader.destroy(`e2score/profile_picture/${publicId}`);

    userDetails.profilePicture = "";
    await userDetails.save();

    return apiResponse(
      res,
      200,
      true,
      "Profile picture removed successfully",
      null,
      null,
    );
  } catch (error) {
    console.error(error);

    return apiResponse(res, 500, false, "Something went wrong");
  }
};

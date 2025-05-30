import User from "../../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import PersonalDetails from "../../models/personalDetails.js";
import CandidateDetails from "../../models/CandidateDetailsModel.js";
import db_sql from "../../config/sqldb.js";
import UserEducation from "../../models/userEducationModel.js";
import axios from "axios";
import FormData from "form-data";

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
    console.log(updated);
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

//update user Details

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

    const { full_name, gender, dob, country, currentLocation, hometown } =
      req.body;

    const updatedUser = await User.findByIdAndUpdate(user_id, {
      name: full_name,
      gender: gender,
      updatedAt: new Date(),
    });

    const personalDetails = await CandidateDetails.findOneAndUpdate(
      { userId: user_id },
      {
        dob: dob,
        country_id: country,
        currentLocation: currentLocation,
        hometown: hometown,
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

    console.log("User Id generated from mongoDB");
    console.log(user);

    if (!user || !profileSummary) {
      return res.status(400).json({ message: "Profile Summary is required." });
    }

    // Update the user's profile with the new picture URL
    const updated = await PersonalDetails.findOneAndUpdate(
      { user: user },
      { profileSummary: profileSummary },
      { new: true }
    );
    console.log(updated);
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
export const addKeySkills = async (req, res) => {
  try {
    const { skills } = req.body; // array of strings
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

    // 🔍 Get skill IDs from SQL
    const placeholders = skills.map(() => "?").join(", ");
    const [rows] = await db_sql.execute(
      `SELECT id, Skill FROM key_skills WHERE Skill IN (${placeholders})`,
      skills
    );

    const skillMap = {};
    rows.forEach((row) => {
      skillMap[row.Skill] = row.id;
    });

    // ❌ Check for missing skills
    const missingSkills = skills.filter((skill) => !skillMap[skill]);
    if (missingSkills.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some skills not found in SQL table.",
        missingSkills,
      });
    }

    // ✅ Convert to comma-separated string of IDs
    const skillIds = skills.map((skill) => skillMap[skill]).join(",");

    // 💾 Save in MongoDB
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

    // console.log("Full response:", response);
    console.log("Response data:", response.data);
    console.log(response.data?.file_path);

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

async function getOrInsertId(tableName, columnName, value) {
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

// Add User Education
/**
 * @route POST /api/useraction/submit-education
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
    let savedRecord;
    if (levelId === "1" || levelId === "2") {
      const boardId = await getOrInsertId(
        "education_boards",
        "board_name",
        data.board
      );
      const educationData = {
        userId: user,
        level: levelId,
        state: data.state,
        board: boardId || null,
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
      );
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
      message: `Education ${
        levelId === "1" || levelId === "2" ? "saved/updated" : "saved"
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

export const updateUserEducation = async (req, res) => {
  try {
    const data = req.body;
    const user = req.userId;
    const levelId = data.level;
    const transcript = req.files?.transcript?.[0];
    const certificate = req.files?.certificate?.[0];
    let transcriptUrl = null;
    let certificateUrl = null;

    const edit_id = req.body._id;

    console.log("edit_id", edit_id);

    return;

    // Upload transcript file if available
    if (transcript) {
      transcriptUrl = await uploadFileToExternalServer(transcript);
    }
    // Upload certificate file if available
    if (certificate) {
      certificateUrl = await uploadFileToExternalServer(certificate);
    }
    let savedRecord;
    if (levelId === "1" || levelId === "2") {
      const boardId = await getOrInsertId(
        "education_boards",
        "board_name",
        data.board
      );
      const educationData = {
        userId: user,
        level: levelId,
        state: data.state,
        board: boardId || null,
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
      );
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
      message: `Education ${
        levelId === "1" || levelId === "2" ? "saved/updated" : "saved"
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

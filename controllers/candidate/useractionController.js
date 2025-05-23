import User from "../../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import PersonalDetails from "../../models/personalDetails.js";
import CandidateDetails from "../../models/CandidateDetailsModel.js";
import db_sql from "../../config/sqldb.js";

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

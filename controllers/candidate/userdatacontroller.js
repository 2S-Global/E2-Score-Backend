import User from "../../models/userModel.js";
import personalDetails from "../../models/personalDetails.js";
import candidateDetails from "../../models/CandidateDetailsModel.js";
import db_sql from "../../config/sqldb.js";
/**
 * @function getUser
 *  @route GET /api/userdata/userdata
 * @description Get the user by user_id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise}
 *  @access protected
 */
export const getUser = async (req, res) => {
  try {
    const user_id = req.userId;
    const user = await User.findById(user_id).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const personalData = await candidateDetails
      .findOne({ userId: user_id }, "dob country_id currentLocation hometown")
      .lean();

    // Fetch gender name from SQL
    let gender_name = "";
    if (user.gender) {
      const [genderResult] = await db_sql.query(
        "SELECT name FROM gender WHERE id = ?",
        [user.gender]
      );
      if (genderResult?.length) {
        gender_name = genderResult[0].name;
      }
    }

    // Combine final data
    const responseData = {
      ...user,
      ...(personalData && {
        dob: personalData.dob,
        country_id: personalData.country_id,
        currentLocation: personalData.currentLocation,
        hometown: personalData.hometown,
      }),
      gender_name,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error in getUser:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @function getResumeHeadline
 * @description Fetch the resume headline of the authenticated user from personal details.
 * @route GET /api/userdata/resumeheadline
 * @param {Object} req - Express request object containing userId
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 * @access protected
 * @throws {Error} 400 - User ID is required
 * @throws {Error} 404 - No headline found
 * @throws {Error} 404 - Resume headline not found
 * @throws {Error} 500 - Internal server error if fetching fails
 */
export const getResumeHeadline = async (req, res) => {
  try {
    const user_id = req.userId;

    // Validate user_id
    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find user in personalDetails collection
    const user = await personalDetails.findOne({ user: user_id });

    // Validate if user exists
    if (!user) {
      return res.status(404).json({ message: "No headline found" });
    }

    // Validate if resumeHeadline exists
    if (!user.resumeHeadline || user.resumeHeadline.trim() === "") {
      return res.status(404).json({ message: "Resume headline not found" });
    }

    res.status(200).json({ resumeHeadline: user.resumeHeadline });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @description Get the Profile Summary by user_id
 * @route GET /api/userdata/profile_summary
 * @access protected
 */
export const getProfileSummary = async (req, res) => {
  try {
    const user_id = req.userId;

    // Validate user_id
    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Fetch user details
    const user = await personalDetails.findOne({ user: user_id });

    // Validate if user document exists
    if (!user) {
      return res.status(404).json({ message: "Profile Sumnmary is not Found" });
    }

    // Validate if profileSummary exists and is non-empty
    if (!user.profileSummary || user.profileSummary.trim() === "") {
      return res.status(404).json({ message: "Profile summary not found" });
    }

    // Success response
    res.status(200).json({ profileSummary: user.profileSummary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @description Get the User Details by user_id
 * @route GET /api/userdata/user_details (new)
 * @access protected
 */
export const getUserDetails = async (req, res) => {
  try {
    const userId = req.userId;

    // Fetch data from User collection
    const userData = await User.findById(userId, "name gender"); // Only select name and gender

    // Fetch data from personalDetails collection
    const personalData = await candidateDetails.findOne(
      { userId: userId },
      "dob country_id currentLocation hometown" // Select only required fields
    );

    if (!userData || !personalData) {
      return res.status(404).json({ message: "User data not found" });
    }

    // Combine and send response
    const result = {
      name: userData.name,
      gender: userData.gender,
      dob: personalData.dob,
      country_id: personalData.country_id,
      currentLocation: personalData.currentLocation,
      hometown: personalData.hometown,
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @description Get the skills of a candidate by user_id
 * @route GET /api/userdata/candidateskills
 * @access protected
 * @returns {object} 200 - Array of skills
 * @returns {object} 404 - User data not found
 * @returns {object} 500 - Error fetching skills
 */
export const getcandidateskills = async (req, res) => {
  try {
    const userId = req.userId;

    // 1. Fetch user skill string from MongoDB
    const candidate = await personalDetails.findOne({ user: userId });

    if (!candidate || !candidate.skills) {
      return res.status(404).json({ message: "User skills not found" });
    }

    // 2. Convert "32046,5332,31680" -> [32046, 5332, 31680]
    const skillIds = candidate.skills
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id)); // remove invalid entries

    if (skillIds.length === 0) {
      return res.status(200).json([]); // return empty array if no valid IDs
    }

    // 3. Generate placeholders (?, ?, ?) dynamically
    const placeholders = skillIds.map(() => "?").join(", ");

    // 4. Query SQL for matching skills
    const [rows] = await db_sql.execute(
      `SELECT Skill FROM key_skills WHERE id IN (${placeholders})`,
      skillIds
    );

    // 5. Extract skill names
    const skillNames = rows.map((row) => row.Skill);

    // 6. Respond
    res.status(200).json(skillNames);
  } catch (error) {
    console.error("Error fetching candidate skills:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

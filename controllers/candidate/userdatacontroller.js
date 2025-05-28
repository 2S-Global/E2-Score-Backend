import User from "../../models/userModel.js";
import personalDetails from "../../models/personalDetails.js";
import candidateDetails from "../../models/CandidateDetailsModel.js";
import db_sql from "../../config/sqldb.js";
import UserEducation from "../../models/userEducationModel.js";
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

/**
 * @description Get the education details of a user by user_id
 * @route GET /api/userdata/usereducation
 * @access protected
 * @returns {object} 200 - Array of education records
 * @returns {object} 404 - User data not found
 * @returns {object} 500 - Error fetching education records
 */
export const getUserEducation = async (req, res) => {
  try {
    const user = req.userId;
    const educationRecords = await UserEducation.find({
      userId: user,
      isDel: false,
    }).sort({ isPrimary: -1 });

    if (!educationRecords) {
      return res.status(404).json({ message: "User education data not found" });
    }
    const responseData = [];

    for (const record of educationRecords) {
      const edu = record.toObject();

      const level_id = record.level;
      edu.level_id = level_id;
      const state_id = record.state;
      const universityId = record.universityName;
      const institute_id = record.instituteName;
      const course_id = record.courseName;
      const course_type_id = record.courseType;
      const grading_system_id = record.gradingSystem;

      const medium_of_education_id = record.medium_of_education;
      const board_id = record.board;

      if (level_id) {
        const [levelRows] = await db_sql.execute(
          "SELECT level FROM education_level WHERE id = ?",
          [level_id]
        );
        if (levelRows.length > 0) {
          edu.level = levelRows[0].level;
        }
      }
      if (state_id) {
        const [stateRows] = await db_sql.execute(
          "SELECT name FROM university_state WHERE id = ?",
          [state_id]
        );
        if (stateRows.length > 0) {
          edu.state = stateRows[0].name;
        }
      }
      if (universityId) {
        const [universityRows] = await db_sql.execute(
          "SELECT name FROM university_univercity WHERE id = ?",
          [universityId]
        );
        if (universityRows.length > 0) {
          edu.universityName = universityRows[0].name;
        }
      }
      if (institute_id) {
        const [instituteRows] = await db_sql.execute(
          "SELECT name FROM university_college WHERE id = ?",
          [institute_id]
        );
        if (instituteRows.length > 0) {
          edu.instituteName = instituteRows[0].name;
        }
      }
      if (course_id) {
        const [courseRows] = await db_sql.execute(
          "SELECT name FROM university_course WHERE id = ?",
          [course_id]
        );
        if (courseRows.length > 0) {
          edu.courseName = courseRows[0].name;
        }
      }
      if (course_type_id) {
        const [courseTypeRows] = await db_sql.execute(
          "SELECT name FROM course_type WHERE id = ?",
          [course_type_id]
        );
        if (courseTypeRows.length > 0) {
          edu.courseType = courseTypeRows[0].name;
        }
      }
      if (grading_system_id) {
        const [gradingSystemRows] = await db_sql.execute(
          "SELECT name FROM grading_system WHERE id = ?",
          [grading_system_id]
        );
        if (gradingSystemRows.length > 0) {
          edu.gradingSystem = gradingSystemRows[0].name;
        }
      }
      if (medium_of_education_id) {
        const [mediumRows] = await db_sql.execute(
          "SELECT name FROM medium_of_education WHERE id = ?",
          [medium_of_education_id]
        );
        if (mediumRows.length > 0) {
          edu.medium_of_education = mediumRows[0].name;
        }
      }
      if (board_id) {
        const [boardRows] = await db_sql.execute(
          "SELECT board_name FROM education_boards WHERE id = ?",
          [board_id]
        );
        if (boardRows.length > 0) {
          edu.board = boardRows[0].board_name;
        }
      }

      responseData.push(edu);
    }

    res.status(200).json({
      message: "User education data fetched successfully",
      data: responseData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

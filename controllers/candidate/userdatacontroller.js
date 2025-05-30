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

    // 1. Get education records
    const educationRecords = await UserEducation.find({
      userId: user,
      isDel: false,
    })
      .sort({ isPrimary: -1 })
      .lean();

    if (!educationRecords || educationRecords.length === 0) {
      return res.status(404).json({ message: "User education data not found" });
    }

    const [
      [levelRows],
      [stateRows],
      [universityRows],
      [instituteRows],
      [courseRows],
      [courseTypeRows],
      [gradingSystemRows],
      [mediumRows],
      [boardRows],
    ] = await Promise.all([
      db_sql.execute("SELECT id, level FROM education_level"),
      db_sql.execute("SELECT id, name FROM university_state"),
      db_sql.execute("SELECT id, name FROM university_univercity"),
      db_sql.execute("SELECT id, name FROM university_college"),
      db_sql.execute("SELECT id, name FROM university_course"),
      db_sql.execute("SELECT id, name FROM course_type"),
      db_sql.execute("SELECT id, name FROM grading_system"),
      db_sql.execute("SELECT id, name FROM medium_of_education"),
      db_sql.execute("SELECT id, board_name FROM education_boards"),
    ]);

    const makeMap = (rows, nameKey = "name") =>
      Object.fromEntries(rows.map((row) => [row.id, row[nameKey]]));

    const maps = {
      level: makeMap(levelRows, "level"),
      state: makeMap(stateRows),
      university: makeMap(universityRows),
      institute: makeMap(instituteRows),
      course: makeMap(courseRows),
      courseType: makeMap(courseTypeRows),
      gradingSystem: makeMap(gradingSystemRows),
      medium: makeMap(mediumRows),
      board: makeMap(boardRows, "board_name"),
    };

    // 4. Transform records
    const responseData = educationRecords.map((record) => {
      const edu = { ...record };
      edu.level_id = record.level;
      edu.level = maps.level[record.level] || record.level;
      edu.state = maps.state[record.state] || record.state;
      edu.universityName =
        maps.university[record.universityName] || record.universityName;
      edu.instituteName =
        maps.institute[record.instituteName] || record.instituteName;
      edu.courseName = maps.course[record.courseName] || record.courseName;
      edu.courseType = maps.courseType[record.courseType] || record.courseType;
      edu.gradingSystem =
        maps.gradingSystem[record.gradingSystem] || record.gradingSystem;
      edu.medium_of_education =
        maps.medium[record.medium_of_education] || record.medium_of_education;
      edu.board = maps.board[record.board] || record.board;

      return edu;
    });

    res.status(200).json({
      message: "User education data fetched successfully",
      data: responseData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @description Get education level details for a user
 * @route GET /api/userdata/level-details
 * @access protected
 * @returns {object} 200 - Education level data
 * @returns {object} 500 - Server error
 */
export const getUserLevelDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const userEducations = await UserEducation.find({
      userId,
      isDel: false,
    });
    const levels = userEducations.map((e) => e.level?.toString());
    const hasLevel1 = levels.includes("1");
    const hasLevel2 = levels.includes("2");
    let query =
      "SELECT id, level, duration, type FROM education_level WHERE is_del = 0 AND is_active = 1";
    const conditions = [];
    if (hasLevel1 && hasLevel2) {
      conditions.push("id NOT IN (1, 2)");
    } else if (hasLevel1) {
      conditions.push("id != 1");
    } else if (hasLevel2) {
      conditions.push("id != 2");
    }
    if (conditions.length > 0) {
      query += ` AND ${conditions.join(" AND ")}`;
    }
    const [rows] = await db_sql.execute(query);
    return res.status(200).json({
      message: "Fetched education level data",
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching user education:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/**
 * @description Fetch education data for edit based on dataId
 * @route GET /api/userdata/edit-user-data
 * @access protected
 * @param {string} dataId - Id of the education data to be edited
 * @returns {object} 200 - Education data
 * @returns {object} 400 - Missing dataId in query parameters
 * @returns {object} 404 - No education data found for this user.
 * @returns {object} 500 - Server error
 */
export const getEditUserData = async (req, res) => {
  try {
    const userId = req.userId;
    const dataId = req.query.dataId;

    if (!dataId) {
      return res
        .status(400)
        .json({ message: "Missing collectionId in query parameters" });
    }
    const userEducation = await UserEducation.findOne({
      userId,
      _id: dataId,
      isDel: false,
    });

    if (!userEducation) {
      return res
        .status(404)
        .json({ message: "No education data found for this user." });
    }

    const responseData = { ...userEducation._doc };
    const { level, board, universityName, courseName, instituteName } =
      userEducation;

    // Helper to fetch name from SQL
    const fetchNameById = async (table, field, id) => {
      const query = `SELECT ${field} AS name FROM ${table} WHERE id = ? `;
      const [rows] = await db_sql.execute(query, [id]);
      return rows.length > 0 ? rows[0].name : "";
    };

    if (level === "1" || level === "2") {
      responseData.board = board
        ? await fetchNameById("education_boards", "board_name", board)
        : "";
    } else {
      const queries = [
        universityName
          ? fetchNameById("university_univercity", "name", universityName)
          : Promise.resolve(""),
        courseName
          ? fetchNameById("university_course", "name", courseName)
          : Promise.resolve(""),
        instituteName
          ? fetchNameById("university_college", "name", instituteName)
          : Promise.resolve(""),
      ];

      const [uniName, course, institute] = await Promise.all(queries);
      responseData.universityName = uniName;
      responseData.courseName = course;
      responseData.instituteName = institute;
    }

    return res.status(200).json({
      message: "Fetched education level data",
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching user education:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

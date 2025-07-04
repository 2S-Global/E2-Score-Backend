import User from "../../models/userModel.js";
import personalDetails from "../../models/personalDetails.js";
import candidateDetails from "../../models/CandidateDetailsModel.js";
import db_sql from "../../config/sqldb.js";
import usereducation from "../../models/userEducationModel.js";
import list_gender from "../../models/monogo_query/genderModel.js";
import { GetProgress } from "../../utility/helper/getprogress.js";
import list_key_skill from "../../models/monogo_query/keySkillModel.js";
import list_education_level from "../../models/monogo_query/educationLevelModel.js";
import list_university_state from "../../models/monogo_query/universityStateModel.js";
import list_university_univercities from "../../models/monogo_query/universityUniversityModel.js";
import list_university_colleges from "../../models/monogo_query/universityCollegesModel.js";
import list_university_course from "../../models/monogo_query/universityCourseModel.js";
import list_course_type from "../../models/monogo_query/courseTypeModel.js";
import list_grading_system from "../../models/monogo_query/gradingSystemModel.js";
import list_medium_of_education from "../../models/monogo_query/mediumOfEducationModel.js";
import list_education_boards from "../../models/monogo_query/educationBoardModel.js";
import list_school_list from "../../models/monogo_query/schoolListModel.js";
import mongoose from "mongoose";
/**
 * @function getUser
 *  @route GET /api/userdata/userdata
 * @description Get the user by user_id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise}
 *  @access protected
 */
export const getUserBySql = async (req, res) => {
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

    // Fetch all UserEducation records for the user and get the max level
    const educations = await UserEducation.find(
      { userId: user_id, isDel: false },
      "level isPrimary"
    ).lean();

    let selectedLevel = null;
    if (educations.length) {
      const primaryEdu = educations.find((edu) => edu.isPrimary === true);
      if (primaryEdu) {
        selectedLevel = parseInt(primaryEdu.level);
      } else {
        selectedLevel = Math.max(
          ...educations
            .map((edu) => parseInt(edu.level))
            .filter((lvl) => !isNaN(lvl))
        );
      }
    }

    let levelName = "";
    if (selectedLevel !== null) {
      const [levelResult] = await db_sql.query(
        "SELECT level FROM education_level WHERE id = ?",
        [selectedLevel]
      );
      if (levelResult?.length) {
        levelName = levelResult[0].level;
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
      degree: levelName || "",
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error in getUser:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Updated API for mongodb
export const getUser = async (req, res) => {
  try {
    const user_id = req.userId;
    const user = await User.findById(user_id).lean();

    const progress = await GetProgress(user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const personalData = await candidateDetails
      .findOne({ userId: user_id }, "dob country_id currentLocation hometown")
      .lean();

    // Fetch gender name from SQL
    let gender_name = "";
    if (user.gender) {
      const genderObjectId = new mongoose.Types.ObjectId(user.gender);
      const genderResult = await list_gender.findOne({
        _id: genderObjectId,
        is_del: 0,
        is_active: 1,
      });

      if (genderResult) {
        gender_name = genderResult.name;
      }
    }

    // Fetch all UserEducation records for the user and get the max level
    const educations = await usereducation.find(
      { userId: user_id, isDel: false },
      "level isPrimary"
    ).lean();

    let selectedLevel = null;
    if (educations.length) {
      const primaryEdu = educations.find((edu) => edu.isPrimary === true);
      if (primaryEdu) {
        selectedLevel = parseInt(primaryEdu.level);
      } else {
        selectedLevel = Math.max(
          ...educations
            .map((edu) => parseInt(edu.level))
            .filter((lvl) => !isNaN(lvl))
        );
      }
    }

    let levelName = "";
    if (selectedLevel !== null) {
      const selectedLevelObjectId = new mongoose.Types.ObjectId(selectedLevel);
      const levelResult = await list_education_level.findOne({
        _id: selectedLevelObjectId,
        is_del: 0,
        is_active: 1,
      });

      if (levelResult) {
        levelName = levelResult.level;
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
      degree: levelName || "",
      progress,
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

    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await personalDetails.findOne({ user: user_id });

    if (!user) {
      return res.status(404).json({ message: "No headline found" });
    }

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

    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await personalDetails.findOne({ user: user_id });

    if (!user) {
      return res.status(404).json({ message: "Profile Sumnmary is not Found" });
    }

    if (!user.profileSummary || user.profileSummary.trim() === "") {
      return res.status(404).json({ message: "Profile summary not found" });
    }

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

    const userData = await User.findById(userId, "name gender");

    const personalData = await candidateDetails.findOne(
      { userId: userId },
      "dob country_id currentLocation hometown"
    );

    if (!userData) {
      return res.status(404).json({ message: "User data not found" });
    }

    const result = {
      name: userData.name || "",
      gender: userData.gender || "",
      dob: personalData?.dob || "",
      country_id: personalData?.country_id || "",
      currentLocation: personalData?.currentLocation || "",
      hometown: personalData?.hometown || "",
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

    const candidate = await personalDetails.findOne({ user: userId }).lean();

    if (!candidate || !candidate.skills || !Array.isArray(candidate.skills)) {
      return res.status(404).json({ message: "User skills not found" });
    }

    const uniqueSkillIds = [...new Set(candidate.skills.map(id => id.toString()))].map(id => new mongoose.Types.ObjectId(id));

    if (uniqueSkillIds.length === 0) {
      return res.status(200).json([]);
    }

    const skills = await list_key_skill.find(
      { _id: { $in: uniqueSkillIds }, is_del: 0, is_active: 1 },
      { Skill: 1, _id: 0 }
    ).lean();

    const skillNames = skills.map(skill => skill.Skill);

    res.status(200).json(skillNames);
  } catch (error) {
    console.error("Error fetching candidate skills:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * @description Get the education details of a user by user_id
 * @route GET /api/userdata/get_user_education
 * @access protected
 * @returns {object} 200 - Array of education records
 * @returns {object} 404 - User data not found
 * @returns {object} 500 - Error fetching education records
 */


export const getUserEducationBySql = async (req, res) => {
  try {
    const user = req.userId;

    // 1. Get education records
    const educationRecords = await UserEducation.find({
      userId: user,
      isDel: false,
    })
      .sort({ level: -1 })
      .lean();

      console.log("Education Records:", educationRecords);

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

export const getUserEducation = async (req, res) => {
  try {
    const userId = req.userId;

    const educationRecords = await usereducation.find({
      userId,
      isDel: false,
    })
      .sort({ level: -1 })
      .lean();

    if (!educationRecords?.length) {
      return res.status(404).json({ message: "No education data found." });
    }

    // Get all unique values used in the records
    const getUniqueValues = (key) => [
      ...new Set(educationRecords.map((rec) => rec[key]).filter(Boolean)),
    ];

    const levelIds = getUniqueValues("level");
    const stateIds = getUniqueValues("state");
    const universityIds = getUniqueValues("universityName");
    const instituteIds = getUniqueValues("instituteName");
    const courseIds = getUniqueValues("courseName");
    const courseTypeIds = getUniqueValues("courseType");
    const gradingSystemIds = getUniqueValues("gradingSystem");
    const mediumIds = getUniqueValues("medium_of_education");
    const boardIds = getUniqueValues("board");
    const schoolIds = getUniqueValues("schoolName");

    const [
      levels,
      states,
      universities,
      institutes,
      courses,
      courseTypes,
      gradingSystems,
      mediums,
      boards,
      schools
    ] = await Promise.all([
      levelIds.length
        ? list_education_level.find({ id: { $in: levelIds } }, { id: 1, level: 1, _id: 0 }).lean()
        : [],
      stateIds.length
        ? list_university_state.find({ id: { $in: stateIds } }, { id: 1, name: 1, _id: 0 }).lean()
        : [],
      universityIds.length
        ? list_university_univercities.find({ id: { $in: universityIds } }, { id: 1, name: 1, _id: 0 }).lean()
        : [],
      instituteIds.length
        ? list_university_colleges.find({ id: { $in: instituteIds } }, { id: 1, name: 1, _id: 0 }).lean()
        : [],
      courseIds.length
        ? list_university_course.find({ id: { $in: courseIds } }, { id: 1, name: 1, _id: 0 }).lean()
        : [],
      courseTypeIds.length
        ? list_course_type.find({ id: { $in: courseTypeIds } }, { id: 1, name: 1, _id: 0 }).lean()
        : [],
      gradingSystemIds.length
        ? list_grading_system.find({ id: { $in: gradingSystemIds } }, { id: 1, name: 1, _id: 0 }).lean()
        : [],
      mediumIds.length
        ? list_medium_of_education.find({ id: { $in: mediumIds } }, { id: 1, name: 1, _id: 0 }).lean()
        : [],
      boardIds.length
        ? list_education_boards.find({ id: { $in: boardIds } }, { id: 1, board_name: 1, _id: 0 }).lean()
        : [],
      schoolIds.length
        ? list_school_list.find({ id: { $in: schoolIds } }, { id: 1, school_name: 1, _id: 0 }).lean()
        : [],
    ]);

    const createMap = (list, valueKey = "name") => {
      return list.reduce((acc, item) => {
        acc[item.id] = item[valueKey];
        return acc;
      }, {});
    };

    const maps = {
      level: createMap(levels, "level"),
      state: createMap(states),
      university: createMap(universities),
      institute: createMap(institutes),
      course: createMap(courses),
      courseType: createMap(courseTypes),
      gradingSystem: createMap(gradingSystems),
      medium: createMap(mediums),
      board: createMap(boards, "board_name"),
      school_name: createMap(schools, "school_name"),
    };

    const responseData = educationRecords.map(record => ({
      ...record,
      level_id: record.level,
      level: maps.level[record.level] || record.level,
      state: maps.state[record.state] || record.state,
      universityName: maps.university[record.universityName] || record.universityName,
      instituteName: maps.institute[record.instituteName] || record.instituteName,
      courseName: maps.course[record.courseName] || record.courseName,
      courseType: maps.courseType[record.courseType] || record.courseType,
      gradingSystem: maps.gradingSystem[record.gradingSystem] || record.gradingSystem,
      medium_of_education: maps.medium[record.medium_of_education] || record.medium_of_education,
      board: maps.board[record.board] || record.board,
      school_name: maps.school_name[record.school_name] || record.school_name,
    }));

    res.status(200).json({
      message: "User education data fetched successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error in getUserEducation:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @description Get education level details for a user
 * @route GET /api/userdata/get_user_level
 * @access protected
 * @returns {object} 200 - Education level data
 * @returns {object} 500 - Server error
 */
export const getUserLevelDetailsBySql = async (req, res) => {
  try {
    const userId = req.userId;
    const userEducations = await UserEducation.find({
      userId,
      isDel: false,
    });
    const levels = userEducations.map((e) => e.level?.toString());
    let query = `SELECT id, level, duration, type FROM education_level WHERE is_del = 0 AND is_active = 1`;

    if (levels.length > 0) {
      const excludedLevels = levels.filter((lvl) => ["1", "2"].includes(lvl));

      if (excludedLevels.length > 0) {
        const placeholders = excludedLevels.map(() => "?").join(", ");
        query += ` AND id NOT IN (${placeholders})`;

        const [rows] = await db_sql.execute(query, excludedLevels);
        return res.status(200).json({
          message: "Fetched education level data",
          data: rows,
        });
      }
    }

    const [rows] = await db_sql.execute(query);
    return res.status(200).json({
      message: "Fetched education level data",
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching user education:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getUserLevelDetails = async (req, res) => {
  try {
    const userId = req.userId;

    const userEducations = await usereducation.find({
      userId,
      isDel: false,
    }).lean();

    const levels = userEducations.map((e) => e.level?.toString());

    const baseQuery = {
      is_del: 0,
      is_active: 1,
    };

    if (levels.length > 0) {
      const excludedLevels = levels.filter((lvl) => ["1", "2"].includes(lvl));
      if (excludedLevels.length > 0) {
        baseQuery.id = { $nin: excludedLevels };
      }
    }

    const rows = await list_education_level.find(baseQuery, {
      id: 1,
      level: 1,
      duration: 1,
      type: 1,
      _id: 0,
    }).lean();

    return res.status(200).json({
      message: "Fetched education level data",
      data: rows,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @description Fetch education data for edit based on dataId
 * @route GET /api/userdata/get_edit_user_data
 * @access protected
 * @param {string} dataId - Id of the education data to be edited
 * @returns {object} 200 - Education data
 * @returns {object} 400 - Missing dataId in query parameters
 * @returns {object} 404 - No education data found for this user.
 * @returns {object} 500 - Server error
 */
export const getEditUserDataBySql = async (req, res) => {
  try {
    const userId = req.userId;
    const dataId = req.query.dataId;

    if (!dataId) {
      return res
        .status(400)
        .json({ message: "Missing collectionId in query parameters" });
    }
    const userEducation = await usereducation.findOne({
      userId,
      _id: dataId,
      isDel: false,
    });

    console.log("User Education:", userEducation);

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

    const levelType = level
      ? await fetchNameById("education_level", "type", level)
      : "";

    return res.status(200).json({
      message: "Fetched education level data",
      data: responseData,
      levelType,
    });
  } catch (error) {
    console.error("Error fetching user education:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};


export const getEditUserData = async (req, res) => {
  try {
    const userId = req.userId;
    const dataId = req.query.dataId;

    if (!dataId) {
      return res
        .status(400)
        .json({ message: "Missing collectionId in query parameters" });
    }
    const userEducation = await usereducation.findOne({
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
    const { level, board, school_name, universityName, courseName, instituteName } =
      userEducation;

    if (level === "1" || level === "2") {
      const [boardVal, school_nameVal] = await Promise.all([
        board
          ? list_education_boards.findOne({ id: board }, { board_name: 1, _id: 0 }).lean().then(doc => doc?.board_name || "")
          : Promise.resolve(""),
        school_name
          ? list_school_list.findOne({ id: school_name }, { school_name: 1, _id: 0 }).lean().then(doc => doc?.school_name || "")
          : Promise.resolve(""),
      ]);

      responseData.board = boardVal;
      responseData.school_name = school_nameVal;

    } else {
      const [universityNameVal, courseNameVal, instituteNameVal] = await Promise.all([
        universityName
          ? list_university_univercities.findOne({ id: universityName }, { name: 1, _id: 0 }).lean().then(doc => doc?.name || "")
          : Promise.resolve(""),
        courseName
          ? list_university_course.findOne({ id: courseName }, { name: 1, _id: 0 }).lean().then(doc => doc?.name || "")
          : Promise.resolve(""),
        instituteName
          ? list_university_colleges.findOne({ id: instituteName }, { name: 1, _id: 0 }).lean().then(doc => doc?.name || "")
          : Promise.resolve(""),
      ]);

      responseData.universityName = universityNameVal;
      responseData.courseName = courseNameVal;
      responseData.instituteName = instituteNameVal;
    }

    const levelType = level
      ? (
        await list_education_level.findOne({ id: level }, { level: 1, _id: 0 }).lean()
      )?.level || ""
      : "";

    return res.status(200).json({
      message: "Fetched education level data",
      data: responseData,
      levelType,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
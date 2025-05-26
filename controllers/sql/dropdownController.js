import db_sql from "../../config/sqldb.js";

/**
 * @description Get all countries from the database
 * @route GET /api/sql/dropdown/All_contry
 * @success {object} 200 - All countries
 * @error {object} 500 - Database query failed
 */
export const All_contry = async (req, res) => {
  try {
    const [rows] = await db_sql.execute(
      "SELECT id , name FROM `tbl_countries` WHERE is_del = 0 AND is_active = 1;"
    );

    res.status(200).json({
      success: true,
      data: rows,
      message: "All country",
    });
  } catch (error) {
    console.error("MySQL error →", error); // 👈 Add this
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

/**
 * @description Get all genders from the database
 * @route GET /api/sql/dropdown/All_gender
 * @success {object} 200 - All genders
 * @error {object} 500 - Database query failed
 */
export const All_gender = async (req, res) => {
  try {
    const [rows] = await db_sql.execute(
      "SELECT id , name FROM `gender` WHERE is_del = 0 AND is_active = 1;"
    );

    res.status(200).json({
      success: true,
      data: rows,
      message: "All Gender",
    });
  } catch (error) {
    console.error("MySQL error →", error); // 👈 Add this
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

/**
 * @description Get 50 random skills from the database
 * @route GET /api/sql/dropdown/Random_Skill
 * @success {object} 200 - Random 50 Skills
 * @error {object} 500 - Database query failed
 */
export const getSkill = async (req, res) => {
  try {
    const [rows] = await db_sql.execute(
      "SELECT Skill FROM `key_skills` WHERE is_del = 0 AND is_active = 1 ORDER BY RAND() LIMIT 50;"
    );

    // Convert to array of strings
    const skills = rows.map((row) => row.Skill);

    res.status(200).json({
      success: true,
      data: skills,
      message: "Random 50 Skills",
    });
  } catch (error) {
    console.error("MySQL error →", error);
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

/**
 * @description Search for matching skills based on the query parameter skill_name
 * @route GET /api/sql/dropdown/searchSkill?skill_name=:skill_name
 * @param {string} skill_name - The string to search for in the skills table
 * @success {object} 200 - Matching skills
 * @error {object} 400 - skill_name query parameter is required
 * @error {object} 500 - Database query failed
 */
export const getMatchingSkill = async (req, res) => {
  const { skill_name } = req.query;
  console.log(skill_name);

  if (!skill_name || skill_name.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "skill_name query parameter is required",
    });
  }

  try {
    const [rows] = await db_sql.execute(
      `SELECT Skill FROM key_skills 
       WHERE is_del = 0 AND is_active = 1 AND Skill LIKE ? 
       ORDER BY Skill LIMIT 50;`,
      [`${skill_name}%`]
    );

    const skills = rows.map((row) => row.Skill);

    res.status(200).json({
      success: true,
      data: skills,
      message: `Matching skills for "${skill_name}"`,
    });
  } catch (error) {
    console.error("MySQL error →", error);
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

/**
 * @description Get all Education Level from the database
 * @route GET /api/sql/dropdown/education_level
 * @success {object} 200 - All Education Level
 * @error {object} 500 - Database query failed
 */
export const getEducationLevel = async (req, res) => {
  try {
    const [rows] = await db_sql.execute(
      "SELECT id , level, duration FROM `education_level` WHERE is_del = 0 AND is_active = 1;"
    );

    res.status(200).json({
      success: true,
      data: rows,
      message: "All Education Level",
    });
  } catch (error) {
    console.error("MySQL error →", error); // 👈 Add this
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

/**
 * @description Get all University State from the database
 * @route GET /api/sql/dropdown/all_university_state
 * @success {object} 200 - All University States
 * @error {object} 500 - Database query failed
 */
export const getAllState = async (req, res) => {
  try {
    const [rows] = await db_sql.execute(
      "SELECT id, name FROM `university_state` WHERE is_del = 0 AND is_active = 1 ORDER BY name ASC;"
    );

    res.status(200).json({
      success: true,
      data: rows,
      message: "All University States",
    });
  } catch (error) {
    console.error("MySQL error →", error); // 👈 Add this
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

/**
 * @description Get all University By State from the database
 * @route GET /api/sql/dropdown/university_state?state_id=4
 * @success {object} 200 - Universities in state ID ${stateId}
 * @error {object} 500 - Database query failede
 */
export const getUniversityByState = async (req, res) => {
  try {
    const stateId = req.query.state_id;

    if (!stateId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing state_id in query." });
    }

    const [rows] = await db_sql.execute(
      "SELECT id, name FROM `university_univercity` WHERE state_id = ? AND is_del = 0 AND is_active = 1;",
      [stateId]
    );

    res.status(200).json({
      success: true,
      data: rows,
      message: `Universities in state ID ${stateId}`,
    });
  } catch (error) {
    console.error("MySQL error →", error); // 👈 Add this
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

/**
 * @description Get all Course By University from the database
 * @route GET http://localhost:8080/api/sql/dropdown/university_course?university_id=4&course_type=UG
 * @success {object} 200 - Courses for university
 * @error {object} 500 - Database query failede
 */

// getUniversityCourse
export const getCourseByUniversity = async (req, res) => {
  try {
    const universityId = req.query.university_id;
    const courseType = req.query.course_type;

    if (!universityId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing university_id in query." });
    }

    // Step 1: Fetch course IDs string from university_college
    const [collegeRows] = await db_sql.execute(
      "SELECT courses FROM university_college WHERE id = ? AND is_del = 0 AND is_active = 1;",
      [universityId]
    );

    if (collegeRows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "University college not found." });
    }

    const courseIdsStr = collegeRows[0].courses;
    if (!courseIdsStr) {
      return res.status(404).json({
        success: false,
        message: "No courses found for this university.",
      });
    }

    // Step 2: Convert course string to array of IDs
    const courseIds = courseIdsStr.split(",").map((id) => id.trim());

    // Step 3: Build query dynamically
    let sql = `SELECT id, name FROM university_course WHERE id IN (${courseIds
      .map(() => "?")
      .join(", ")})`;
    const values = [...courseIds];

    if (courseType) {
      sql += ` AND type = ?`;
      values.push(courseType);
    }

    const [courseRows] = await db_sql.execute(sql, values);

    res.status(200).json({
      success: true,
      data: courseRows,
      message: "Courses for university",
    });
  } catch (error) {
    console.error("MySQL error →", error);
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

/**
 * @description Get all Grading System from the database
 * @route GET /api/sql/dropdown/grading_system
 * @success {object} 200 - All Grading Systems
 * @error {object} 500 - Database query failed
 */
export const getGradingSystem = async (req, res) => {
  try {
    const [rows] = await db_sql.execute(
      "SELECT id, name FROM `grading_system` WHERE is_del = 0 AND is_active = 1;"
    );

    res.status(200).json({
      success: true,
      data: rows,
      message: "All Grading Systems",
    });
  } catch (error) {
    console.error("MySQL error →", error); // 👈 Add this
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

/**
 * @description Get all Course Type from the database
 * @route GET /api/sql/dropdown/course_type
 * @success {object} 200 - All Course Type
 * @error {object} 500 - Database query failed
 */
export const getCourseType = async (req, res) => {
  try {
    const [rows] = await db_sql.execute(
      "SELECT id, name FROM `course_type` WHERE is_del = 0 AND is_active = 1;"
    );

    res.status(200).json({
      success: true,
      data: rows,
      message: "All Course Type",
    });
  } catch (error) {
    console.error("MySQL error →", error); // 👈 Add this
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

/**
 * @description Get all State Wise Board from the database
 * @route GET /api/sql/dropdown/state_wise_board?state_id=6
 * @success {object} 200 - State Wise Education Board
 * @error {object} 500 - Database query failed
 */
export const getEducationBoardById = async (req, res) => {
  try {
    const boardId = req.query.state_id;

    console.log(boardId);
    console.log("State Wise Board is running");

    const [rows] = await db_sql.execute(
      "SELECT id, board_name FROM education_boards WHERE state_region_id = ? OR state_region_id = 0",
      [boardId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Education Board not found",
      });
    }

    res.status(200).json({
      success: true,
      data: rows,
      message: "Education Board details",
    });
  } catch (error) {
    console.error("MySQL error →", error);
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

/**
 * @description Get all Medium Of Education from the database
 * @route GET /api/sql/dropdown/medium_of_education
 * @success {object} 200 - All Medium
 * @error {object} 500 - Database query failed
 */
export const getAllMediumOfEducation = async (req, res) => {
  try {
    console.log("Get All Medium Of education");

    const [rows] = await db_sql.execute(
      "SELECT id, name FROM `medium_of_education` WHERE is_del = 0 AND is_active = 1;"
    );

    res.status(200).json({
      success: true,
      data: rows,
      message: "All Medium Of Education",
    });
  } catch (error) {
    console.error("MySQL error →", error);
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

/**
 * @description Get College Name by University Id from the database
 * @route GET /api/sql/dropdown/college_name?university_id=6
 * @success {object} 200 - College Name based on University Id
 * @error {object} 500 - Database query failed
 */
export const getCollegeNameById = async (req, res) => {
  try {
    const universityId = req.query.university_id;

    const [rows] = await db_sql.execute(
      "SELECT id,name FROM university_college WHERE university_id = ? AND is_del = 0 AND is_active = 1;",
      [universityId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "College Name not found",
      });
    }

    res.status(200).json({
      success: true,
      data: rows,
      message: "College Name based on University Id",
    });
  } catch (error) {
    console.error("MySQL error →", error);
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

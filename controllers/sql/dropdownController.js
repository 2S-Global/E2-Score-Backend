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
      "SELECT id , level, duration ,type FROM `education_level` WHERE is_del = 0 AND is_active = 1;"
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
    const universityNames = rows.map((row) => row.name);

    res.status(200).json({
      success: true,
      data: universityNames,
      message: `Universities in state ID ${stateId}`,
    });
  } catch (error) {
    console.error("MySQL error →", error); // 👈 Add this
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

/**
 * @description Retrieve courses offered by a specific university, filtered by state, college, and course type.
 * @route GET /api/sql/dropdown/university_course
 * @param {string} req.query.state_id - The ID of the state where the university is located.
 * @param {string} req.query.university_id - The name of the university.
 * @param {string} req.query.college_name - The name of the college within the university.
 * @param {string} req.query.course_type - The type of course to filter by.
 * @returns {object} 200 - An array of course names that match the filters.
 * @returns {object} 400 - If the course_type parameter is missing or empty.
 * @returns {object} 404 - If no courses are found matching the given criteria.
 * @returns {object} 500 - If there is an error executing the database query.
 */
export const getCourseByUniversity = async (req, res) => {
  try {
    const { state_id, university_id, college_name, course_type } = req.query;

    /*  if (!course_type || course_type.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "course_type is required",
      });
    } */

    let courseIds = [];

    const allFiltersProvided =
      state_id && university_id && college_name && course_type;

    if (allFiltersProvided) {
      const [universityIdResult] = await db_sql.execute(
        "SELECT id FROM university_univercity WHERE name = ? AND is_del = 0 AND is_active = 1",
        [university_id.trim()]
      );

      if (universityIdResult.length > 0) {
        const universityId = universityIdResult[0].id;

        const [universityRows] = await db_sql.execute(
          "SELECT id FROM university_univercity WHERE id = ? AND state_id = ? AND is_del = 0 AND is_active = 1",
          [universityId, state_id]
        );

        if (universityRows.length > 0) {
          const [collegeRows] = await db_sql.execute(
            "SELECT courses FROM university_college WHERE university_id = ? AND name = ? AND is_del = 0 AND is_active = 1",
            [universityId, college_name.trim()]
          );

          if (collegeRows.length > 0 && collegeRows[0].courses) {
            courseIds = collegeRows[0].courses
              .split(",")
              .map((id) => id.trim())
              .filter(Boolean);
          }
        }
      }
    }

    // Build course query
    let sql = "";
    let values = [];
    let sql_na = "";

    if (courseIds.length > 0) {
      // Filter by specific course IDs and course_type
      sql = `SELECT id, name FROM university_course WHERE id IN (${courseIds
        .map(() => "?")
        .join(",")}) AND type = ? AND is_del = 0 AND is_active = 1 LIMIT 50`;
      values = [...courseIds, course_type];
    } else {
      sql = `SELECT id, name FROM university_course WHERE type = ? AND is_del = 0 AND is_active = 1 LIMIT 50`;
      values = [course_type];
    }

    const [courseRows] = await db_sql.execute(sql, values);
    const courseNames = courseRows.map((row) => row.name);

    if (courseNames.length === 0) {
      sql_na = `SELECT id, name FROM university_course WHERE  is_del = 0 AND is_active = 1 LIMIT 50`;
      const [naCourseRows] = await db_sql.execute(sql_na);
      const courseNames = naCourseRows.map((row) => row.name);
      if (courseNames.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No courses found IN the database",
        });
      }

      res.status(200).json({
        success: true,
        data: courseNames,
        message: "Courses based on provided filters",
      });
    } else {
      res.status(200).json({
        success: true,
        data: courseNames,
        message: "Courses based on provided filters",
      });
    }
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

    const boardNames = rows.map((row) => row.board_name);

    res.status(200).json({
      success: true,
      data: boardNames,
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
 * @description Get all College Name based on University Id from the database
 * @route GET api/sql/dropdown/college_name?university_id=SBS34545%20College&state_id=32
 * @success {object} 200 - College Name based on University Id
 * @error {object} 500 - Database query failed
 */
export const getCollegeNameById = async (req, res) => {
  try {
    const university_name = req.query.university_id;
    const university_state = req.query.state_id;

    if (!university_name || university_name.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "university_name is required" });
    }

    if (!university_state) {
      return res
        .status(400)
        .json({ success: false, message: "state_id is required" });
    }

    const [existingUniversity] = await db_sql.execute(
      "SELECT id FROM university_univercity WHERE name = ? AND state_id = ? AND is_del = 0 AND is_active = 1",
      [university_name.trim(), university_state]
    );

    let universityId;
    let collegeRows = [];

    if (existingUniversity.length > 0) {
      universityId = existingUniversity[0].id;

      [collegeRows] = await db_sql.execute(
        "SELECT id,name FROM university_college WHERE university_id = ? AND is_del = 0 AND is_active = 1;",
        [universityId]
      );

      if (collegeRows.length === 0) {
        [collegeRows] = await db_sql.execute(
          "SELECT id, name FROM university_college WHERE is_del = 0 AND is_active = 1 LIMIT 50"
        );
      }
    } else {
      const [insertResult] = await db_sql.execute(
        "INSERT INTO university_univercity (name, state_id, is_active, is_del, flag) VALUES (?, ?, 0, 0, 1)",
        [university_name.trim(), university_state]
      );

      universityId = insertResult.insertId;
      [collegeRows] = await db_sql.execute(
        "SELECT id, name FROM university_college WHERE is_del = 0 AND is_active = 1 LIMIT 50"
      );
    }

    if (collegeRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "College Name not found",
      });
    }
    const collegeNames = collegeRows.map((row) => row.name);

    res.status(200).json({
      success: true,
      data: collegeNames,
      message: "College Name based on University Id",
    });
  } catch (error) {
    console.error("MySQL error →", error);
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

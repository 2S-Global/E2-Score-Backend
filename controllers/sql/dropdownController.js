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

/*************  ✨ Windsurf Command ⭐  *************/
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
      [`%${skill_name}%`]
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

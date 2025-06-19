import db_sql from "../../config/sqldb.js";

/**
 * @description Get all project tag from the database
 * @route GET /api/candidate/project/get_project_tag
 * @success {object} 200 - Project Tag Data Fetched Successfully
 * @error {object} 500 - Database query failed
 */

export const getProjectTag = async (req, res) => {
    try {
      const [rows] = await db_sql.execute(
        "SELECT _id,name FROM `project_tag` WHERE is_del = 0 AND is_active = 1;"
      );
  
      res.status(200).json({
        success: true,
        data: rows,
        message: "Project Tag Data Fetched Successfully",
      });
    } catch (error) {
      console.error("MySQL error →", error);
      res.status(500).json({ success: false, message: "Database query failed" });
    }
  };
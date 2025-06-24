import db_sql from "../../config/sqldb.js";

/**
 * @description Search for matching Company based on the query parameter company_name
 * @route GET /api/candidate/employment/matching_company?company_name=:company_name
 * @param {string} company_name - The string to search for in the company table
 * @success {object} 200 - Matching Company
 * @error {object} 400 - company_name query parameter is required
 * @error {object} 500 - Database query failed
 */
export const getMatchingCompany = async (req, res) => {
  const { company_name } = req.query;

  if (!company_name || company_name.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "company_name query parameter is required",
    });
  }

  try {
    const [rows] = await db_sql.execute(
      `SELECT NAME FROM company 
       WHERE is_del = 0 AND is_active = 1 AND NAME LIKE ? 
       ORDER BY NAME LIMIT 50;`,
      [`${company_name}%`]
    );

    const company = rows.map((row) => row.NAME);

    res.status(200).json({
      success: true,
      data: company,
      message: `Matching companies for "${company_name}"`,
    });
  } catch (error) {
    console.error("MySQL error →", error);
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};
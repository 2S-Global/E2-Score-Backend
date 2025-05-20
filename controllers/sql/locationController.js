import db_sql from "../../config/sqldb.js";

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

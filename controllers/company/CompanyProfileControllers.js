import companylist from "../../models/CompanyListModel.js";

export const SearchCompanybyCin = async (req, res) => {
  const { cin } = req.body;
  console.log(cin);

  if (!cin) {
    return res.status(400).json({
      message: "CIN number is required",
      success: false,
    });
  }

  try {
    const company = await companylist.findOne({ cinnumber: cin });
    if (!company) {
      return res.status(404).json({
        message: "Company not found",
        success: false,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Company found",
      data: company,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

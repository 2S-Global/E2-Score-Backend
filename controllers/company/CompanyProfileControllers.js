import companylist from "../../models/CompanyListModel.js";
import CompanyDetails from "../../models/company_Models/companydetails.js";
import User from "../../models/userModel.js";
import uploadToCloudinary from "../../utility/uploadToCloudinary.js";
import deleteImageByUrl from "../../utility/deleteImageByUrl.js";
/**
 * @description Search company by CIN number
 * @route POST /api/companyprofile/search_company_by_cin
 * @param {string} cin - CIN number
 * @returns {object} Company details if found
 * @returns {object} 404 - Company not found
 * @returns {object} 500 - Internal server error
 */
export const SearchCompanybyCin = async (req, res) => {
  const { cin } = req.body;
  console.log(cin);

  if (!cin) {
    return res.status(400).json({
      message: "CIN number is required . ",
      success: false,
    });
  }

  try {
    const company = await companylist.findOne({ cinnumber: cin });

    if (!company) {
      return res.status(404).json({
        message:
          "Company not found . Please check your CIN number or Enter Details Manually . ",
        success: false,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Company Details found. ",
      data: company,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @description Add or update a company's details for the authenticated user.
 * @route POST /api/companyprofile/add_or_update_company
 * @param {object} req.body - Company details to add or update
 * @param {string} [req.body.cin_id] - Company CIN ID
 * @param {string} [req.body.cin] - Company CIN number
 * @param {string} [req.body.name] - Company name
 * @param {string} [req.body.email] - Company email
 * @param {string} [req.body.phone] - Company phone number
 * @param {string} [req.body.address] - Company address
 * @param {string} [req.body.website] - Company website
 * @param {Date} [req.body.established] - Established date
 * @param {string} [req.body.teamsize] - Team size
 * @param {string} [req.body.industry_type] - Industry type
 * @param {boolean} [req.body.allowinsearch] - Allow company to appear in search
 * @param {string} [req.body.about] - About the company
 * @param {object} req.files - Uploaded files
 * @param {object} [req.files.logo] - Company logo file
 * @param {object} [req.files.cover] - Company cover image file
 * @returns {object} 200 - Company details updated successfully
 * @returns {object} 400 - User ID is required
 * @returns {object} 404 - User not found
 * @returns {object} 500 - Internal server error
 */
export const AddorUpdateCompany = async (req, res) => {
  try {
    const {
      cin_id,
      cin,
      name,
      email,
      phone,
      address,
      website,
      established,
      teamsize,
      industry_type,
      allowinsearch,
      about,
    } = req.body;

    const logo = req.files?.logo?.[0];
    const cover = req.files?.cover?.[0];
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Validate user
    const user = await User.findById(userId);
    if (!user || user.is_del) {
      return res.status(404).json({ message: "User not found." });
    }

    // Handle logo and cover uploads concurrently
    const [logoResult, coverResult] = await Promise.all([
      logo
        ? uploadToCloudinary(logo.buffer, "e2score/logo", `logo-${Date.now()}`)
        : null,
      cover
        ? uploadToCloudinary(
          cover.buffer,
          "e2score/cover",
          `cover-${Date.now()}`
        )
        : null,
    ]);

    // Insert or update company
    const company = await CompanyDetails.findOneAndUpdate(
      { userId },
      {
        cin_id: cin_id?.trim(),
        cin: cin?.trim(),
        name: name?.trim(),
        email: email?.trim(),
        phone: phone?.trim(),
        address: address?.trim(),
        website: website?.trim(),
        established,
        teamsize,
        industry_type: industry_type?.trim(),
        allowinsearch: !!allowinsearch,
        about: about?.trim(),
        ...(logoResult && { logo: logoResult.secure_url }),
        ...(coverResult && { cover: coverResult.secure_url }),
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Company details updated successfully.",
      links: {
        logo: logoResult?.secure_url || null,
        cover: coverResult?.secure_url || null,
      },
    });
  } catch (error) {
    console.error("Error in AddorUpdateCompany:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error", error });
  }
};

/**
 * @description Get the company details of the user
 * @route GET /api/companyprofile/get_company_details
 * @success {object} 200 - Company details
 * @error {object} 404 - Company not found
 * @error {object} 500 - Internal server error
 */
export const GetCompanyDetails = async (req, res) => {
  try {
    const company = await CompanyDetails.findOne({
      userId: req.userId,
      isDel: false,
    });

    if (company) {
      return res.status(200).json({ success: true, data: company });
    }

    // 2. If not found, fallback to User collection
    const user = await User.findOne(
      { _id: req.userId },
      {
        company_id: 1,
        cin_number: 1,
        name: 1,
        email: 1,
        phone_number: 1,
        address: 1,
      }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({
      success: true,
      data: {
        cin_id: user.company_id || null,
        cinnumber: user.cin_number || null,
        companyname: user.name || null,
        companyemail: user.email || null,
        companyphone: user.phone_number || null,
        companyaddress: user.address || null,
      },
    });
  } catch (error) {
    console.error("Error in GetCompanyDetails:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error", error });
  }
};

/**
 * @description Delete the cover photo of the user's company
 * @route DELETE /api/companyprofile/delete_cover_photo
 * @success {object} 200 - Company details
 * @error {object} 404 - Company not found
 * @error {object} 500 - Internal server error
 */
export const Deletecoverphoto = async (req, res) => {
  try {
    const company = await CompanyDetails.findOne({
      userId: req.userId,
      isDel: false,
    });

    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found." });
    }

    // Delete from Cloudinary if cover exists
    if (company.cover) {
      const result = await deleteImageByUrl(company.cover);
      /*       console.log(result); */
    }

    // Update DB to remove cover reference
    company.cover = "";
    await company.save();

    return res.status(200).json({
      success: true,
      message: "Cover photo deleted",
    });
  } catch (error) {
    console.error("Error in Deletecoverphoto:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting cover photo",
      error: error.message,
    });
  }
};

/**
 * @description Get the account details of the user
 * @route GET /api/companyprofile/get_account_details
 * @success {object} 200 - Account details
 * @error {object} 404 - Company not found
 * @error {object} 500 - Internal server error
 */
export const GetAccountDetails = async (req, res) => {
  try {
    const company = await User.findById(req.userId);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }
    return res.status(200).json({
      success: true,
      data: {
        companyname: company.name,
        email: company.email,
        phone: company.phone_number,
      },
    });
  } catch (error) {
    console.error("Error in GetAccountDetails:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error", error });
  }
};

export const updateAccountDetails = async (req, res) => {
  try {
    const { companyname, companyemail, companyphone } = req.body;

    // Basic validation
    if (!companyname || !companyphone) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    const company = await User.findById(req.userId);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found." });
    }

    company.name = companyname;
    // company.email = companyemail;
    company.phone_number = companyphone;

    await company.save();

    return res
      .status(200)
      .json({ success: true, message: "Account updated successfully." });
  } catch (error) {
    console.error("Error in updateAccountDetails:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error", error });
  }
};

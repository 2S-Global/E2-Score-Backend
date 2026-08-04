import CompanyPackage from "../../models/companyPackageModel.js";
import mongoose from "mongoose";
import User from "../../models/userModel.js";
import Package from "../../models/packageModel.js";
import { emailQueue } from "../../queues/emailQueue.js";


/**
 * @description this function will attach a company with a perticular package
 * @route GET /api/companyPackageRoute/createCompanyPackage
 * @success {object} 200 - this gives us all the list of active packages
 * @error {object} 500 - Error Occured in Database query failed
 */


export const createCompanyPackage = async (req, res) => {
  try {
    const {
      companyId,
      selected_plan,
      discount_percent,
      aadhar_otp,
      aadhar_price,
      hotel_module,
      housing_module
    } = req.body;

    if (!companyId || !selected_plan) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const finalDiscount = discount_percent ? Number(discount_percent) : 0;

    const planIds =
      typeof selected_plan === "string"
        ? selected_plan.split(",").map((id) => id.trim())
        : Array.isArray(selected_plan)
        ? selected_plan
        : [];

    const updatedOrCreated = await CompanyPackage.findOneAndUpdate(
      { companyId },
      {
        companyId,
        selected_plan: planIds,
        discount_percent: finalDiscount,
        aadhar_otp: aadhar_otp,
        aadhar_price: aadhar_price,
        hotel_module: hotel_module,
        housing_module: housing_module,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    const company = await User.findById(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Fetch plan names and details
    const plans = await Package.find({ _id: { $in: planIds } }).select(
      "name description"
    );
    const planDetailsHtml = plans
      .map(
        (plan) => `
          <p>
            <strong>• Package Name:</strong> <strong>${plan.name}</strong><br/>
            <strong>• Package Details:</strong> <strong>${plan.description}</strong>
          </p>
        `
      )
      .join("");

    // Send email via queue
    await emailQueue.add("company_package_activation", {
      email: company.email,
      companyName: company.name,
      planDetailsHtml,
      discount: finalDiscount,
    });

    res.status(200).json({
      success: true,
      message: "Package created or updated successfully",
      data: updatedOrCreated,
    });
  } catch (error) {
    console.error("Server Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resendCompanyPackageEmail = async (req, res) => {
  try {
    const { companyId } = req.body;

    if (!companyId) {
      return res
        .status(400)
        .json({ success: false, message: "Company ID is required" });
    }

    // Get company and package
    const company = await User.findById(companyId);
    const companyPackage = await CompanyPackage.findOne({ companyId });

    if (!company || !companyPackage) {
      return res
        .status(200)
        .json({ success: true, message: "Company Package not found" });
    }

    const { selected_plan, discount_percent } = companyPackage;

    // Convert comma-separated string to array (if necessary)
    let planIds = [];
    if (typeof selected_plan === "string") {
      planIds = selected_plan.split(",").map((id) => id.trim());
    } else if (Array.isArray(selected_plan)) {
      planIds = selected_plan;
    }

    // Get plan details
    const plans = await Package.find({ _id: { $in: planIds } }).select(
      "name description"
    );
    const planDetailsHtml = plans
      .map(
        (plan) => `
          <p>
            <strong>• Package Name:</strong> <strong>${plan.name}</strong><br/>
            <strong>• Package Details:</strong> <strong>${plan.description}</strong>
          </p>
        `
      )
      .join("");

    // Send email via queue
    await emailQueue.add("company_package_activation_resend", {
      email: company.email,
      companyName: company.name,
      planDetailsHtml,
      discount: discount_percent,
    });
    console.log("Resend email sent successfully to", company.email);

    res.status(200).json({
      success: true,
      message: "Email resent successfully",
    });
  } catch (error) {
    console.error("Resend Email Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * @description return the list of all active packages by a perticular company ID
 * @route GET /api/companyPackageRoute/getAllPackages
 * @success {object} 200 - this gives us all the list of active packages
 * @error {object} 500 - Error Occured in Database query failed
 */

export const getCompanyPackagesByCompanyId = async (req, res) => {
  try {
    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "companyId is required in body",
      });
    }

    const data = await CompanyPackage.findOne({ companyId }).populate(
      "companyId",
      "name email"
    ); // populate user details

    if (!data) {
      return res.status(200).json({
        success: false,
        message: "No packages found for this company",
      });
    }

    res.status(200).json({ success: true, data }); // ✅ data is a single object now
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * @description return the list of all details of a perticular Company
 * @route GET /api/companyPackageRoute/getPackageByCompany
 * @success {object} 200 - this gives us all the details of active packages
 * @error {object} 500 - Error Occured in Database query failed
 */

export const getPackageByCompany = async (req, res) => {
  try {
    const companyId = new mongoose.Types.ObjectId(req.userId);

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "User ID is missing",
      });
    }

    const data = await CompanyPackage.findOne({ companyId: companyId })
      .populate("companyId", "name email") // populate user info
      .populate("selected_plan"); // populate plan info (optional)

    if (!data) {
      return res.status(200).json({
        success: false,
        message: "No packages found for this company",
      });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Utility to parse plan_id string/array
const parsePlanIds = (selected_plan) => {
  if (typeof selected_plan === "string") {
    return selected_plan.split(",").map((id) => id.trim());
  }
  return Array.isArray(selected_plan) ? selected_plan : [];
};


/**
 * @description return if the company is allowed for AADHAR With OTP Verification
 * @route GET /api/companyPackageRoute/sidebarAadharOtp
 * @success {object} 200 - this gives us all the details of active packages
 * @error {object} 500 - Error Occured in Database query failed
 */

export const sidebarAadharOtp = async (req, res) => {
  try {
    const companyId = new mongoose.Types.ObjectId(req.userId);

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "User ID is missing",
      });
    }

    const data = await CompanyPackage.findOne({ companyId });

    if (!data) {
      return res.status(200).json({
        success: false,
        aadhar_otp: "disable",
        message: "No packages found for this company",
      });
    }


    const aadharOtpStatus = data.aadhar_otp;
    const hoteltatus = data.hotel_module;
    const housingStatus = data.housing_module;

    return res.status(200).json({
      success: true,
      aadhar_otp: aadharOtpStatus,
      hoteltatus: hoteltatus,
      housingStatus: housingStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

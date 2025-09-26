import list_job_specialization from "../../models/ListJobSpecializationModel.js";
import list_job_type from "../../models/ListJobTypeModel.js";
import list_job_benefit from "../../models/ListJobBenefitModel.js";
import list_job_career_level from "../../models/ListJobCareerLevelModel.js";
import list_job_qualification from "../../models/ListJobQualificationModel.js";
import list_job_experience_level from "../../models/ListJobExperienceLevelModel.js";
import list_job_mode from "../../models/ListJobModeModel.js";
import User from "../../models/userModel.js";
import CompanyBranch from "../../models/company_Models/CompanyBranch.js";
import JobPosting from "../../models/company_Models/JobPostingModel.js";
import mongoose from "mongoose";

// List Job Specializations
export const AllJobSpecialization = async (req, res) => {
  try {
    const Specializations = await list_job_specialization.find(
      { isDel: false, isActive: true, isFlag: false },
      { _id: 1, name: 1 }
    );

    res.status(200).json({
      success: true,
      data: Specializations,
      message: "All Speacializations",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

// List Job Types
export const AllJobTypes = async (req, res) => {
  try {
    const jobTypes = await list_job_type.find(
      { isDel: false, isActive: true, isFlag: false },
      { _id: 1, name: 1 }
    );

    res.status(200).json({
      success: true,
      data: jobTypes,
      message: "All job Types",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

// List Job Benefits
export const AllJobBenefits = async (req, res) => {
  try {
    const jobBenefits = await list_job_benefit.find(
      { isDel: false, isActive: true, isFlag: false },
      { _id: 1, name: 1 }
    );

    res.status(200).json({
      success: true,
      data: jobBenefits,
      message: "All Job Benefits",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

// List Job Career Levels
export const AllJobCareerLevels = async (req, res) => {
  try {
    const jobCareerLevels = await list_job_career_level.find(
      { isDel: false, isActive: true, isFlag: false },
      { _id: 1, name: 1 }
    );

    res.status(200).json({
      success: true,
      data: jobCareerLevels,
      message: "All Job Career Levels",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

// List Job Qualifications
export const AllJobQualifications = async (req, res) => {
  try {
    const jobQualifications = await list_job_qualification.find(
      { isDel: false, isActive: true, isFlag: false },
      { _id: 1, name: 1 }
    );

    res.status(200).json({
      success: true,
      data: jobQualifications,
      message: "All Job Qualifications",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

// List Job Experience Levels
export const AllJobExperienceLevels = async (req, res) => {
  try {
    const jobExperienceLevels = await list_job_experience_level.find(
      { isDel: false, isActive: true, isFlag: false },
      { _id: 1, name: 1 }
    );

    res.status(200).json({
      success: true,
      data: jobExperienceLevels,
      message: "All Job Experience Levels",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

// List Job Modes
export const AllJobModes = async (req, res) => {
  try {
    const jobModes = await list_job_mode.find(
      { isDel: false, isActive: true, isFlag: false },
      { _id: 1, name: 1 }
    );

    res.status(200).json({
      success: true,
      data: jobModes,
      message: "All Job Modes",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

// All Company Branches
export const AllCompanyBranches = async (req, res) => {
  try {

    const company = await User.findById(req.userId);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    const companyBranches = await CompanyBranch.find(
      { userId: req.userId, is_del: false },
      { name: 1 }
    ).lean();

    res.status(200).json({
      success: true,
      data: companyBranches,
      message: "All company Branches",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

// Add Job Posting Details API
export const AddJobPostingDetails = async (req, res) => {
  try {

    const userId = req.userId;

    const company = await User.findById(req.userId);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    const {
      jobTitle,
      jobDescription,
      getApplicationUpdateEmail,
      specialization,
      jobType,
      positionAvailable,
      showBy,
      expectedHours,
      contractLength,
      contractPeriod,
      jobExpiryDate,
      salary,
      benefits,
      careerLevel,
      experienceLevel,
      gender,
      industry,
      qualification,
      jobLocationType,
      country,
      city,
      branch,
      address,
      advertiseCity,
      advertiseCityName,
    } = req.body;

    console.log("Here is the body data", req.body);

    // Convert repeated fields to arrays if sent as string
    const parseToArray = (field) => {
      if (!field) return [];
      return Array.isArray(field) ? field : [field];
    };
    console.log("hello I am here !");

    const newJob = new JobPosting({
      userId,
      jobTitle,
      jobDescription,
      getApplicationUpdateEmail,
      specialization: parseToArray(specialization).map(id => mongoose.Types.ObjectId(id)),
      jobType: parseToArray(jobType).map(id => mongoose.Types.ObjectId(id)),
      positionAvailable,
      showBy,
      expectedHours,
      contractLength,
      contractPeriod,
      jobExpiryDate: jobExpiryDate ? new Date(jobExpiryDate) : null,
      salary: {
        structure: salary?.structure || " ",
        currency: salary?.currency || " ",
        min: salary?.min ? Number(salary.min) : null,
        max: salary?.max ? Number(salary.max) : null,
        amount: salary?.amount ? Number(salary.amount) : null,
        rate: salary?.rate || "per year",
      },
      benefits: parseToArray(benefits).map(id => mongoose.Types.ObjectId(id)),
      careerLevel: careerLevel ? mongoose.Types.ObjectId(careerLevel) : null,
      experienceLevel: experienceLevel ? mongoose.Types.ObjectId(experienceLevel) : null,
      gender: parseToArray(gender).map(id => mongoose.Types.ObjectId(id)),
      industry,
      qualification: parseToArray(qualification).map(id => mongoose.Types.ObjectId(id)),
      jobLocationType,
      country: country ? mongoose.Types.ObjectId(country) : null,
      city: city ? mongoose.Types.ObjectId(city) : null,
      branch: branch ? mongoose.Types.ObjectId(branch) : null,
      address,
      advertiseCity,
      advertiseCityName,
      status: "draft"
    });

    console.log("New Job Object:", newJob);

    const savedJob = await newJob.save();

    res.status(200).json({
      success: true,
      message: "Job posting created successfully",
      jobId: savedJob._id,
      data: savedJob,
    });
  } catch (error) {
    console.error("Error creating job posting:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Job Posting Details API
export const GetJobPostingDetails = async (req, res) => {
  try {

    const userId = req.userId;
    const { jobId, status } = req.query;

    console.log("User ID:", userId, "Job ID:", jobId, "Status:", status);

    const company = await User.findById(userId);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    // console.log("Here is the Company Details", company);

    // Find job by id, status, and userId
    let job = await JobPosting.findOne({ _id: jobId, status, userId })
      .populate("specialization jobType benefits careerLevel experienceLevel gender qualification country city branch").lean();  // 👈 important;

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found, status mismatch, or not authorized."
      });
    }

    job.companyName = company.name;

    console.log("Here is the fetch Job Details", company.name);

    res.status(200).json({
      success: true,
      message: "Job fetched successfully",
      data: job,
    });
  } catch (error) {
    console.error("Error creating job posting:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
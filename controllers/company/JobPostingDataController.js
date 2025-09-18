import list_job_specialization from "../../models/ListJobSpecializationModel.js";
import list_job_type from "../../models/ListJobTypeModel.js";
import list_job_benefit from "../../models/ListJobBenefitModel.js";
import list_job_career_level from "../../models/ListJobCareerLevelModel.js";
import list_job_qualification from "../../models/ListJobQualificationModel.js";
import list_job_experience_level from "../../models/ListJobExperienceLevelModel.js";
import list_job_mode from "../../models/ListJobModeModel.js";

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
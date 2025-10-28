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
import CompanyDetails from "../../models/company_Models/companydetails.js";
import list_industries from "../../models/monogo_query/industryModel.js";
import mongoose from "mongoose";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
dayjs.extend(relativeTime);

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

    // console.log("Request body:", req.body);

    const {
      jobTitle,
      jobDescription,
      getApplicationUpdateEmail,
      specialization,
      jobType,
      positionAvailable,
      showBy,
      expectedHours,
      fromHours,
      toHours,
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

    console.log("Here is the body data by CSSSS )()()()()(", req.body);

    // ------------------- ADD HERE -------------------
    let finalFromHours = fromHours;
    let finalToHours = toHours;

    if (showBy !== "range") {
      finalFromHours = "";
      finalToHours = "";
    }
    // -------------------------------------------------

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
      fromHours: finalFromHours,
      toHours: finalToHours,
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
    const { jobId } = req.query;

    console.log("User ID:", userId, "Job ID:", jobId);

    const company = await User.findById(userId);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    console.log("Here is the Company Details", company);

    // Find job by id, status, and userId
    let job = await JobPosting.findOne({ _id: jobId, userId, status: { $in: ["draft", "completed"] } })
      .populate("specialization jobType benefits careerLevel experienceLevel gender qualification country city branch").lean();  // 👈 important;

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found, status mismatch, or not authorized."
      });
    }

    // Fetch industry name (if applicable)
    let industryName = "Not specified";
    if (job.industry) {
      const industryDoc = await list_industries.findOne({ id: job.industry }).select("job_industry").lean();
      job.industryName = industryDoc?.job_industry || industryName;
    }

    job.companyName = company.name;
    job.phoneNumber = company.phone_number;

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

// Edit Job Posting Details API
export const EditJobPostingDetails = async (req, res) => {
  try {

    const userId = req.userId;

    const { jobId } = req.query;
    if (!jobId) {
      return res.status(404).json({ message: "jobId not provided in query parameter." });
    }

    // const id = mongoose.Types.ObjectId(jobId);

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
      fromHours,
      toHours,
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
    // ------------------- ADD HERE -------------------
    let finalFromHours = fromHours;
    let finalToHours = toHours;

    if (showBy !== "range") {
      finalFromHours = "";
      finalToHours = "";
    }
    // -------------------------------------------------

    // Convert repeated fields to arrays if sent as string
    const parseToArray = (field) => {
      if (!field) return [];
      return Array.isArray(field) ? field : [field];
    };
    console.log("hello I am here EditJobPosting API !");
    console.log("Id type is : ", typeof jobId, jobId);

    const updatedJob = await JobPosting.findOneAndUpdate(
      { _id: jobId, status: { $in: ["draft", "completed"] } },
      {
        userId,
        jobTitle,
        jobDescription,
        getApplicationUpdateEmail,
        specialization: parseToArray(specialization).map(id => mongoose.Types.ObjectId(id)),
        jobType: parseToArray(jobType).map(id => mongoose.Types.ObjectId(id)),
        positionAvailable,
        showBy,
        expectedHours,
        fromHours: finalFromHours,
        toHours: finalToHours,
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
        // status: "draft"
      },
      { new: true } // return updated document
    );

    console.log("New Job Object:", updatedJob);

    // const savedJob = await newJob.save();

    res.status(200).json({
      success: true,
      message: "Job posting created successfully",
      jobId: updatedJob._id,
      data: updatedJob,
    });
  } catch (error) {
    console.error("Error creating job posting:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Confirm Job Posting Details API
export const ConfirmJobPostingDetails = async (req, res) => {
  try {
    const userId = req.userId;

    const company = await User.findById(userId);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    const { jobId } = req.query;

    if (!jobId) {
      return res.status(404).json({ message: "jobId not provided in query parameter." });
    }

    const updatedJob = await JobPosting.findOneAndUpdate(
      { _id: jobId, userId, status: { $in: ["draft", "completed"] } },
      {
        status: "completed"
      },
      { new: true } // return updated document
    );

    console.log("New Job Object:", updatedJob);

    // const savedJob = await newJob.save();

    res.status(200).json({
      success: true,
      message: "Job posting created successfully",
      jobId: updatedJob._id,
      data: updatedJob,
    });
  } catch (error) {
    console.error("Error creating job posting:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Job Listing API
export const getAllJobListing = async (req, res) => {
  try {

    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const company = await User.findById(userId);
    if (!company) {
      return res.status(404).json({ message: "User not found." });
    }

    // Fetch logo from companyDetails
    const companyDetails = await CompanyDetails.findOne({ userId }).select("logo");
    const logo = companyDetails?.logo || null;

    const today = new Date();

    // Fetch jobs for this user where status is "completed" and expiryDate is not passed
    const jobs = await JobPosting.find({
      userId,
      status: "completed",
      is_del: false
    })
      .populate("jobType", "name")
      .populate("country", "name")
      .populate("city", "city_name")
      .populate("branch", "name")
      .select("_id jobTitle jobType jobLocationType advertiseCity advertiseCityName country city branch createdAt jobExpiryDate")
      .sort({ createdAt: -1 })
      .lean();

    // console.log("Here is my all Job List", jobs)

    // Build response
    const jobList = jobs.map((job) => {
      let location = "";
      let advertiseCityName = "";

      // Remote job logic
      if (job.jobLocationType === "remote") {
        location = "Remote";
        advertiseCityName =
          job.advertiseCity === "Yes" ? (job.advertiseCityName || "") : "";
      }

      // On-site job logic
      else if (job.jobLocationType === "on-site") {
        const country = job.country?.name || "";
        const city = job.city?.city_name || "";
        const branch = job.branch?.name || "";

        location = [city, country].filter(Boolean).join(", ");
      }

      // Format date to "October 27, 2017"
      const formatDate = (date) => {
        if (!date) return "";
        return new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      };

      return {
        _id: job._id,
        jobTitle: job.jobTitle,
        jobType: job.jobType.map((item) => item.name),
        jobLocationType: job.jobLocationType,
        location,
        advertiseCityName,
        createdAt: formatDate(job.createdAt),
        expiryDate: formatDate(job.jobExpiryDate),
        isActive: !job.jobExpiryDate || new Date(job.jobExpiryDate) >= today,
        logo,
      };
    });

    res.status(200).json({
      success: true,
      message: "Job listing fetched successfully.",
      data: jobList,
    });
  } catch (error) {
    console.error("Error fetching job listings:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Job Posting API
export const deleteJobPosting = async (req, res) => {
  try {
    const userId = req.userId;

    const company = await User.findById(userId);
    if (!company) {
      return res.status(404).json({ message: "User not found." });
    }

    const { jobId } = req.query;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "jobId is required.",
      });
    }

    // Find the job only if it belongs to this employer
    const job = await JobPosting.findOne({
      _id: jobId,
      userId,
      status: "completed",
      is_del: false
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or access denied.",
      });
    }

    // ✅ Soft delete - mark status as deleted
    job.is_del = true;
    await job.save();

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully.",
      jobId: job._id,
    });

  } catch (error) {
    console.error("Error deleting job posting:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Get Job Preview Details API
export const getJobPreviewDetails = async (req, res) => {
  try {

    console.log("I am inside Job Preview Details API ! ");

    const userId = req.userId;
    const { jobId } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const company = await User.findById(userId);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    // Find job by id, status, and userId
    let job = await JobPosting.findOne({ _id: jobId, userId, status: { $in: ["draft", "completed"] } })
      .populate("specialization jobType benefits careerLevel experienceLevel gender qualification country city branch").lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found, status mismatch, or not authorized."
      });
    }

    // Fetch industry name (if applicable)
    let industryName = "";
    if (job.industry) {
      const industryDoc = await list_industries.findOne({ id: job.industry }).select("job_industry").lean();
      industryName = industryDoc?.job_industry || industryName;
    }

    // Fetch company logo & cover
    const companyDetails = await CompanyDetails.findOne({ userId }).select("logo cover website").lean();
    const logoImage = companyDetails?.logo || null;
    const coverImage = companyDetails?.cover || null;
    const companyWebsite = companyDetails?.website || null;

    // Location & advertiseCity logic
    let location = "";
    let advertiseCityName = "";

    if (job.jobLocationType === "remote") {
      location = "Remote";
      advertiseCityName = job.advertiseCity === "Yes" ? (job.advertiseCityName || "") : "";
    } else if (job.jobLocationType === "hybrid") {
      location = "Hybrid";
      advertiseCityName = "";
    } else if (job.jobLocationType === "on-site") {
      const country = job.country?.name || "";
      const city = job.city?.city_name || "";
      const branch = job.branch?.name || "";
      // location = [branch, city, country].filter(Boolean).join(", ") || "On-site";
      location = [city, country].filter(Boolean).join(", ") || "On-site";
      advertiseCityName = "";
    } else {
      location = "Not specified";
      advertiseCityName = "";
    }

    const hasExpectedHours = !!job?.expectedHours;
    const isPartTime = job?.jobType?.some(
      jt => jt.name?.toLowerCase() === "part-time"
    );

    //Optimized return statement started

    const response = {
      jobId: job._id,
      title: job.jobTitle,
      jobDescription: job.jobDescription,
      industry: industryName,
      specialization: job.specialization?.map(sp => sp.name) || [],
      jobType: job.jobType?.map(jt => jt.name) || [],
      expectedHours: hasExpectedHours && isPartTime ? job.expectedHours : "",
      benefits: job.benefits?.map(b => b.name) || [],
      careerLevel: job.careerLevel?.name || null,
      experienceLevel: job.experienceLevel?.name || null,
      gender: job.gender?.map(g => g.name) || [],
      qualification: job.qualification?.map(q => q.name) || [],
      jobLocationType: job.jobLocationType,
      location,
      advertiseCityName,
      createdAgo: dayjs(job.createdAt).fromNow(),
      expiredAt: job.jobExpiryDate ? new Date(job.jobExpiryDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }) : "",
      salary: job.salary,
      logoImage: logoImage,
      coverImage: coverImage,
      companyWebsite: companyWebsite,
      companyName: company?.name || "",
      // company: {
      //   name: company.name,
      //   phoneNumber: company.phone_number,
      //   logoImage,
      //   coverImage
      // }
    };

    //Optimized return statement ended

    res.status(200).json({
      success: true,
      message: "Job Preview Details Fetched successfully !",
      data: response,
    });
  } catch (error) {
    console.error("Error fetching job listings:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
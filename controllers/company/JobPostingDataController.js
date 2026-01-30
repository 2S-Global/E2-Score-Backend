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
import list_key_skill from "../../models/monogo_query/keySkillModel.js";
import JobTitleModel from "../../models/JobTitleModel.js";
import JobApplication from "../../models/jobApplicationModel.js";
import list_tbl_countrie from "../../models/monogo_query/countriesModel.js";
import list_india_cities from "../../models/monogo_query/indiaCitiesModel.js";
import list_tbl_state from "../../models/monogo_query/StatesModel.js";
import InterviewFeedback from "../../models/InterviewFeedbackModel.js";
import mongoose from "mongoose";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import nodemailer from "nodemailer";


dayjs.extend(relativeTime);


export const AllJobTitles = async (req, res) => {
  try {
    const searchText = req.query.q || ""; // text user typed

    const jobTitles = await JobTitleModel.find({
      isDel: false,
      title: { $regex: searchText, $options: "i" }, // case-insensitive match
    })
      .sort({ title: 1 })
      .limit(20); // prevent large DB load

    return res.status(200).json({
      success: true,
      count: jobTitles.length,
      data: jobTitles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching job titles",
      error: error.message,
    });
  }
};


// List Job Specializations
export const AllJobSpecialization = async (req, res) => {
  try {
    const { query } = req.query; // search text from frontend

    const specializations = await list_job_specialization.find(
      {
        isDel: false,
        isActive: true,
        name: { $regex: query || "", $options: "i" },
      },
      { _id: 1, name: 1 }
    );

    res.status(200).json({
      success: true,
      data: specializations,
      message: "Specializations fetched successfully",
    });
  } catch (error) {
    console.log("ERROR:", error);
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
      state,
      branch,
      address,
      advertiseCity,
      advertiseCityName,
      resumeRequired,
      jobSkills
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

    // new block of code for skills started
    if (!Array.isArray(jobSkills) || jobSkills.length === 0) {
      return res.status(400).json({
        message: "Skills must be a non-empty array of strings.",
      });
    }

    if (!jobSkills.every(skill => typeof skill === "string")) {
      return res.status(400).json({
        message: "All skills must be strings.",
      });
    }
    // new block of code for skills ended

    // new block of code for skills started
    if (!Array.isArray(specialization) || specialization.length === 0) {
      return res.status(400).json({
        message: "Specialization must be a non-empty array of strings.",
      });
    }

    if (!specialization.every(spec => typeof spec === "string")) {
      return res.status(400).json({
        message: "All specializations must be strings.",
      });
    }
    // new block of code for skills ended

    /*
  // Iterrate Skills from name to array starts from here  --- 31th october

  if (!Array.isArray(jobSkills) || jobSkills.length === 0) {
    return res.status(400).json({
      message: "Skills must be a non-empty array of strings.",
    });
  }

  // Case: If skills came as a string from form-data
  let parsedSkills = jobSkills;
  if (typeof jobSkills === "string") {
    try {
      parsedSkills = JSON.parse(jobSkills);
    } catch (e) {
      return res.status(400).json({ message: "Invalid skills format." });
    }
  }

  const allStrings = parsedSkills.every((skill) => typeof skill === "string");
  if (!allStrings) {
    return res.status(400).json({ message: "All skills must be strings." });
  }

  // Find matching skills in MongoDB

  const matchedSkills = await list_key_skill.find({
    Skill: { $in: parsedSkills },
    is_del: 0,
    is_active: 1,
  }, "_id Skill");

  const skillMap = {};
  matchedSkills.forEach((row) => {
    skillMap[row.Skill] = row._id;
  });

  const missingSkills = parsedSkills.filter((skill) => !skillMap[skill]);
  if (missingSkills.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Some skills not found in the database.",
      missingSkills,
    });
  }

  const skillObjectIds = parsedSkills.map((skill) => skillMap[skill]);
  */


    // Iterrate Skills from name to array ends here   -- 31th october


    const newJob = new JobPosting({
      userId,
      jobTitle,
      jobDescription,
      getApplicationUpdateEmail,
      // specialization: parseToArray(specialization).map(id => mongoose.Types.ObjectId(id)),
      specialization: specialization,
      // jobSkills: skillObjectIds,
      jobSkills: jobSkills,
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
      // country: country ? mongoose.Types.ObjectId(country) : null,
      country: country ? country : null,
      // city: city ? mongoose.Types.ObjectId(city) : null,
      city: city ? city : null,
      state: state ? state : null,
      branch: branch ? mongoose.Types.ObjectId(branch) : null,
      address,
      advertiseCity,
      advertiseCityName,
      status: "draft",
      resumeRequired: resumeRequired
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

    // console.log("Here is the Company Details", company);

    // Find job by id, status, and userId
    let job = await JobPosting.findOne({ _id: jobId, userId, status: { $in: ["draft", "completed"] } })
      .populate("specialization jobType benefits careerLevel experienceLevel gender qualification country city branch jobSkills").lean();  // 👈 important;

    console.log("Here is my Job Posting Details", job);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found, status mismatch, or not authorized."
      });
    }

    const [countryDoc, stateDoc, cityDoc] = await Promise.all([
      job.country
        ? list_tbl_countrie.findOne({ id: job.country }).select("name").lean()
        : null,

      job.state
        ? list_tbl_state.findOne({ id: job.state }).select("name").lean()
        : null,

      job.city
        ? list_india_cities.findOne({ id: job.city }).select("city_name").lean()
        : null,
    ]);


    // Fetch industry name (if applicable)
    let industryName = "Not specified";
    if (job.industry) {
      const industryDoc = await list_industries.findOne({ id: job.industry }).select("job_industry").lean();
      job.industryName = industryDoc?.job_industry || industryName;
    }

    job.companyName = company.name;
    job.phoneNumber = company.phone_number;
    job.countryName = countryDoc?.name || null;
    job.stateName = stateDoc?.name || null;
    job.cityName = cityDoc?.city_name || null;


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
      state,
      branch,
      address,
      advertiseCity,
      advertiseCityName,
      resumeRequired,
      jobSkills
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

    // new block of code for skills started
    if (!Array.isArray(jobSkills) || jobSkills.length === 0) {
      return res.status(400).json({
        message: "Skills must be a non-empty array of strings.",
      });
    }

    if (!jobSkills.every(skill => typeof skill === "string")) {
      return res.status(400).json({
        message: "All skills must be strings.",
      });
    }
    // new block of code for skills ended

    // new block of code for Specialization started
    if (!Array.isArray(specialization) || specialization.length === 0) {
      return res.status(400).json({
        message: "Specialization must be a non-empty array of strings.",
      });
    }

    if (!specialization.every(spec => typeof spec === "string")) {
      return res.status(400).json({
        message: "All specializations must be strings.",
      });
    }
    // new block of code for Specialization ended


    /*
    // Iterrate Skills from name to array starts from here  --- 31th october

    if (!Array.isArray(jobSkills) || jobSkills.length === 0) {
      return res.status(400).json({
        message: "Skills must be a non-empty array of strings.",
      });
    }

    // Case: If skills came as a string from form-data
    let parsedSkills = jobSkills;
    if (typeof jobSkills === "string") {
      try {
        parsedSkills = JSON.parse(jobSkills);
      } catch (e) {
        return res.status(400).json({ message: "Invalid skills format." });
      }
    }

    const allStrings = parsedSkills.every((skill) => typeof skill === "string");
    if (!allStrings) {
      return res.status(400).json({ message: "All skills must be strings." });
    }

    // Find matching skills in MongoDB
    const matchedSkills = await list_key_skill.find({
      Skill: { $in: parsedSkills },
      is_del: 0,
      is_active: 1,
    }, "_id Skill");

    const skillMap = {};
    matchedSkills.forEach((row) => {
      skillMap[row.Skill] = row._id;
    });

    const missingSkills = parsedSkills.filter((skill) => !skillMap[skill]);
    if (missingSkills.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some skills not found in the database.",
        missingSkills,
      });
    }

    const skillObjectIds = parsedSkills.map((skill) => skillMap[skill]);



    console.log("Here is my all skill object IDS --", skillObjectIds);

    */


    // Iterrate Skills from name to array ends here   -- 31th october

    const updatedJob = await JobPosting.findOneAndUpdate(
      { _id: jobId, status: { $in: ["draft", "completed"] } },
      {
        userId,
        jobTitle,
        jobDescription,
        getApplicationUpdateEmail,
        // specialization: parseToArray(specialization).map(id => mongoose.Types.ObjectId(id)),
        specialization: specialization,
        // jobSkills: skillObjectIds,
        jobSkills: jobSkills,
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
        // country: country ? mongoose.Types.ObjectId(country) : null,
        // city: city ? mongoose.Types.ObjectId(city) : null,
        country: country ? country : null,
        city: city ? city : null,
        state: state ? state : null,
        branch: branch ? mongoose.Types.ObjectId(branch) : null,
        address,
        advertiseCity,
        advertiseCityName,
        resumeRequired: resumeRequired || false,
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
      // status: "completed",
      status: { $in: ["completed", "draft"] },
      is_del: false
    })
      .populate("jobType", "name")
      .populate("country", "name")
      .populate("city", "city_name")
      .populate("branch", "name")
      .select("_id jobTitle jobType jobLocationType advertiseCity advertiseCityName country city branch createdAt jobExpiryDate status")
      .sort({ createdAt: -1 })
      .lean();

    // console.log("Here is my all Job List", jobs)

    // Get all job IDs
    const jobIds = jobs.map(job => job._id);

    // Aggregate application counts
    const applicationCounts = await JobApplication.aggregate([
      {
        $match: {
          jobId: { $in: jobIds },
          isDel: false
        }
      },
      {
        $group: {
          _id: "$jobId",
          appliedCount: { $sum: 1 }
        }
      }
    ]);

    // Convert to lookup map
    const applicationCountMap = {};
    applicationCounts.forEach(item => {
      applicationCountMap[item._id.toString()] = item.appliedCount;
    });

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
        appliedCount: applicationCountMap[job._id.toString()] || 0,
        status: job.status,
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

    const userId = req.userId;
    const { jobId } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const company = await User.findById(userId);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    // Find job by id, status, and userId   (Only For Employer it will work)
    // let job = await JobPosting.findOne({ _id: jobId, userId, status: { $in: ["draft", "completed"] } })
    //   .populate("specialization jobType benefits careerLevel experienceLevel gender qualification country city branch").lean();

    // It will work for both candidate and employer
    let job = await JobPosting.findOne({ _id: jobId, status: { $in: ["draft", "completed"] } })
      .populate("specialization jobType benefits careerLevel experienceLevel gender qualification country city branch").lean();

    console.log("Here is my Job Posting All Details - 30th october: ", job);

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
    const companyDetails = await CompanyDetails.findOne({ userId: job.userId }).select("logo cover website").lean();
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

// Apply to Job Posting API (Candidate)
export const applyJobPosting = async (req, res) => {
  try {
    const userId = req.userId;
    const { jobId } = req.query;
    const {
      noticePeriod,
      preferredTime,
      availabilityOnSaturday,
      willingToRelocate,
      description,
      acceptedTerms,
      experienceLevel
    } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    if (!acceptedTerms) {
      return res.status(400).json({
        success: false,
        message: "You must accept Terms and Conditions",
      });
    }

    if (
      !noticePeriod ||
      !preferredTime ||
      !availabilityOnSaturday ||
      !willingToRelocate ||
      !experienceLevel
    ) {
      return res.status(400).json({
        success: false,
        message: "All mandatory fields are required",
      });
    }

    // 🔍 Check if already applied
    const alreadyApplied = await JobApplication.findOne({
      jobId,
      userId,
    });

    if (alreadyApplied) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    // Create application directly
    await JobApplication.create({
      jobId,
      userId,
      noticePeriod,
      preferredTime,
      availabilityOnSaturday,
      willingToRelocate,
      description,
      acceptedTerms,
      experienceLevel,
    });

    res.status(200).json({
      success: true,
      message: "Job applied successfully",
    });
  } catch (error) {
    console.error("Error creating job posting:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAppliedCandidatesByJob = async (req, res) => {
  try {
    const { jobId } = req.query;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const appliedCandidates = await JobApplication.aggregate([
      // 1️⃣ Match jobId and non-deleted records
      {
        $match: {
          jobId: new mongoose.Types.ObjectId(jobId),
          isDel: false,
          status: "applied",
        },
      },

      // 2️⃣ Join User collection
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

      // 3️⃣ Join Personal Details (skills)
      {
        $lookup: {
          from: "personaldetails",
          localField: "userId",
          foreignField: "userId",
          as: "personalDetails",
        },
      },
      { $unwind: { path: "$personalDetails", preserveNullAndEmptyArrays: true } },

      // 4️⃣ Join Candidate Details (location)
      {
        $lookup: {
          from: "candidatedetails",
          localField: "userId",
          foreignField: "userId",
          as: "candidateDetails",
        },
      },
      { $unwind: { path: "$candidateDetails", preserveNullAndEmptyArrays: true } },

      // 5️⃣ Join User Career (job role & salary)
      {
        $lookup: {
          from: "usercareers",
          localField: "userId",
          foreignField: "userId",
          as: "career",
        },
      },
      { $unwind: { path: "$career", preserveNullAndEmptyArrays: true } },

      // 🔴 FIX: Convert JobRole string → ObjectId
      {
        $addFields: {
          jobRoleObjectId: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$career.JobRole", null] },
                  { $ne: ["$career.JobRole", ""] },
                ],
              },
              then: { $toObjectId: "$career.JobRole" },
              else: null,
            },
          },
        },
      },

      // 6️⃣ Join Job Role master
      // {
      //   $lookup: {
      //     from: "list_job_roles",
      //     localField: "career.JobRole",
      //     foreignField: "_id",
      //     as: "jobRoleData",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$jobRoleData",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },

      // 6️⃣ Lookup Job Role master
      {
        $lookup: {
          from: "list_job_roles",
          localField: "jobRoleObjectId",
          foreignField: "_id",
          as: "jobRoleData",
        },
      },
      {
        $unwind: {
          path: "$jobRoleData",
          preserveNullAndEmptyArrays: true,
        },
      },


      // 6️⃣ Final response shape
      {
        $project: {
          _id: 1,
          userId: 1,
          status: 1,
          noticePeriod: 1,
          experienceLevel: 1,

          candidateName: "$user.name",
          profilePicture: "$user.profilePicture",

          skills: "$personalDetails.skills",
          currentLocation: "$candidateDetails.currentLocation",

          jobRole: "$jobRoleData.job_role",
          expectedSalary: "$career.expectedSalary",
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: appliedCandidates.length,
      data: appliedCandidates,
    });
  } catch (error) {
    console.error("Error fetching applied candidates:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all shortlisted candidates for a job
export const getShortlistedCandidatesByJob = async (req, res) => {
  try {
    const { jobId } = req.query;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const appliedCandidates = await JobApplication.aggregate([
      // 1️⃣ Match jobId and non-deleted records
      {
        $match: {
          jobId: new mongoose.Types.ObjectId(jobId),
          isDel: false,
          status: "shortlisted",
        },
      },

      // 2️⃣ Join User collection
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

      // 3️⃣ Join Personal Details (skills)
      {
        $lookup: {
          from: "personaldetails",
          localField: "userId",
          foreignField: "userId",
          as: "personalDetails",
        },
      },
      { $unwind: { path: "$personalDetails", preserveNullAndEmptyArrays: true } },

      // 4️⃣ Join Candidate Details (location)
      {
        $lookup: {
          from: "candidatedetails",
          localField: "userId",
          foreignField: "userId",
          as: "candidateDetails",
        },
      },
      { $unwind: { path: "$candidateDetails", preserveNullAndEmptyArrays: true } },

      // 5️⃣ Join User Career (job role & salary)
      {
        $lookup: {
          from: "usercareers",
          localField: "userId",
          foreignField: "userId",
          as: "career",
        },
      },
      { $unwind: { path: "$career", preserveNullAndEmptyArrays: true } },

      // 🔴 FIX: Convert JobRole string → ObjectId
      {
        $addFields: {
          jobRoleObjectId: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$career.JobRole", null] },
                  { $ne: ["$career.JobRole", ""] },
                ],
              },
              then: { $toObjectId: "$career.JobRole" },
              else: null,
            },
          },
        },
      },

      // 6️⃣ Join Job Role master
      // {
      //   $lookup: {
      //     from: "list_job_roles",
      //     localField: "career.JobRole",
      //     foreignField: "_id",
      //     as: "jobRoleData",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$jobRoleData",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },

      // 6️⃣ Lookup Job Role master
      {
        $lookup: {
          from: "list_job_roles",
          localField: "jobRoleObjectId",
          foreignField: "_id",
          as: "jobRoleData",
        },
      },
      {
        $unwind: {
          path: "$jobRoleData",
          preserveNullAndEmptyArrays: true,
        },
      },


      // 6️⃣ Final response shape
      {
        $project: {
          _id: 1,
          userId: 1,
          status: 1,
          noticePeriod: 1,
          experienceLevel: 1,

          candidateName: "$user.name",
          profilePicture: "$user.profilePicture",

          skills: "$personalDetails.skills",
          currentLocation: "$candidateDetails.currentLocation",

          jobRole: "$jobRoleData.job_role",
          expectedSalary: "$career.expectedSalary",
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: appliedCandidates.length,
      data: appliedCandidates,
    });
  } catch (error) {
    console.error("Error fetching applied candidates:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all offer sent candidates for a job
export const getOfferSentCandidatesByJob = async (req, res) => {
  try {
    const { jobId } = req.query;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const appliedCandidates = await JobApplication.aggregate([
      // 1️⃣ Match jobId and non-deleted records
      {
        $match: {
          jobId: new mongoose.Types.ObjectId(jobId),
          isDel: false,
          status: "offer_sent",
        },
      },

      // 2️⃣ Join User collection
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

      // 3️⃣ Join Personal Details (skills)
      {
        $lookup: {
          from: "personaldetails",
          localField: "userId",
          foreignField: "userId",
          as: "personalDetails",
        },
      },
      { $unwind: { path: "$personalDetails", preserveNullAndEmptyArrays: true } },

      // 4️⃣ Join Candidate Details (location)
      {
        $lookup: {
          from: "candidatedetails",
          localField: "userId",
          foreignField: "userId",
          as: "candidateDetails",
        },
      },
      { $unwind: { path: "$candidateDetails", preserveNullAndEmptyArrays: true } },

      // 5️⃣ Join User Career (job role & salary)
      {
        $lookup: {
          from: "usercareers",
          localField: "userId",
          foreignField: "userId",
          as: "career",
        },
      },
      { $unwind: { path: "$career", preserveNullAndEmptyArrays: true } },

      // 🔴 FIX: Convert JobRole string → ObjectId
      {
        $addFields: {
          jobRoleObjectId: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$career.JobRole", null] },
                  { $ne: ["$career.JobRole", ""] },
                ],
              },
              then: { $toObjectId: "$career.JobRole" },
              else: null,
            },
          },
        },
      },

      // 6️⃣ Join Job Role master
      // {
      //   $lookup: {
      //     from: "list_job_roles",
      //     localField: "career.JobRole",
      //     foreignField: "_id",
      //     as: "jobRoleData",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$jobRoleData",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },

      // 6️⃣ Lookup Job Role master
      {
        $lookup: {
          from: "list_job_roles",
          localField: "jobRoleObjectId",
          foreignField: "_id",
          as: "jobRoleData",
        },
      },
      {
        $unwind: {
          path: "$jobRoleData",
          preserveNullAndEmptyArrays: true,
        },
      },


      // 6️⃣ Final response shape
      {
        $project: {
          _id: 1,
          userId: 1,
          status: 1,
          noticePeriod: 1,
          experienceLevel: 1,

          candidateName: "$user.name",
          profilePicture: "$user.profilePicture",

          skills: "$personalDetails.skills",
          currentLocation: "$candidateDetails.currentLocation",

          jobRole: "$jobRoleData.job_role",
          expectedSalary: "$career.expectedSalary",
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: appliedCandidates.length,
      data: appliedCandidates,
    });
  } catch (error) {
    console.error("Error fetching applied candidates:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all Invitation sent candidates for a job
export const getInvitationSentCandidatesByJob = async (req, res) => {
  try {
    const { jobId } = req.query;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const appliedCandidates = await JobApplication.aggregate([
      // 1️⃣ Match jobId and non-deleted records
      {
        $match: {
          jobId: new mongoose.Types.ObjectId(jobId),
          isDel: false,
          status: "invitation_sent",
        },
      },

      // 2️⃣ Join User collection
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

      // 3️⃣ Join Personal Details (skills)
      {
        $lookup: {
          from: "personaldetails",
          localField: "userId",
          foreignField: "userId",
          as: "personalDetails",
        },
      },
      { $unwind: { path: "$personalDetails", preserveNullAndEmptyArrays: true } },

      // 4️⃣ Join Candidate Details (location)
      {
        $lookup: {
          from: "candidatedetails",
          localField: "userId",
          foreignField: "userId",
          as: "candidateDetails",
        },
      },
      { $unwind: { path: "$candidateDetails", preserveNullAndEmptyArrays: true } },

      // 5️⃣ Join User Career (job role & salary)
      {
        $lookup: {
          from: "usercareers",
          localField: "userId",
          foreignField: "userId",
          as: "career",
        },
      },
      { $unwind: { path: "$career", preserveNullAndEmptyArrays: true } },

      // 🔴 FIX: Convert JobRole string → ObjectId
      {
        $addFields: {
          jobRoleObjectId: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$career.JobRole", null] },
                  { $ne: ["$career.JobRole", ""] },
                ],
              },
              then: { $toObjectId: "$career.JobRole" },
              else: null,
            },
          },
        },
      },

      // 6️⃣ Join Job Role master
      // {
      //   $lookup: {
      //     from: "list_job_roles",
      //     localField: "career.JobRole",
      //     foreignField: "_id",
      //     as: "jobRoleData",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$jobRoleData",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },

      // 6️⃣ Lookup Job Role master
      {
        $lookup: {
          from: "list_job_roles",
          localField: "jobRoleObjectId",
          foreignField: "_id",
          as: "jobRoleData",
        },
      },
      {
        $unwind: {
          path: "$jobRoleData",
          preserveNullAndEmptyArrays: true,
        },
      },


      // 6️⃣ Final response shape
      {
        $project: {
          _id: 1,
          userId: 1,
          status: 1,
          noticePeriod: 1,
          experienceLevel: 1,

          candidateName: "$user.name",
          profilePicture: "$user.profilePicture",

          skills: "$personalDetails.skills",
          currentLocation: "$candidateDetails.currentLocation",

          jobRole: "$jobRoleData.job_role",
          expectedSalary: "$career.expectedSalary",
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: appliedCandidates.length,
      data: appliedCandidates,
    });
  } catch (error) {
    console.error("Error fetching applied candidates:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Reject Job Application Status API
export const rejectJobApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.body;

    // 1️⃣ Validate input
    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: "Application ID is required",
      });
    }

    // 3️⃣ Update status
    const updatedApplication = await JobApplication.findByIdAndUpdate(
      applicationId,
      { status: "rejected" },
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({
        success: false,
        message: "Job application not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Application status updated to rejected",
      data: updatedApplication,
    });

  } catch (error) {
    console.error("Update Job Application Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Accept Job Application Status API
export const acceptJobApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.body;

    // 1️⃣ Validate input
    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: "Application ID is required",
      });
    }

    console.log("Here is applicationId:", applicationId);

    // 2️⃣ Find application first (optional but recommended)
    const application = await JobApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Job application not found",
      });
    }

    // 3️⃣ Validate current status (only allow applied → shortlisted)
    if (application.status !== "applied") {
      return res.status(400).json({
        success: false,
        message: `Cannot shortlist application with status '${application.status}'`,
      });
    }

    // 4️⃣ Update status
    application.status = "shortlisted";
    await application.save();

    // 5️⃣ Fetch candidate details
    const user = await User.findById(application.userId).select("email name");

    // 🔹 NEW: Fetch job details using application.jobId
    const job = await JobPosting.findById(application.jobId).select(
      "jobTitle userId"
    );

    // 🔹 NEW: Fetch company name from company user (job.userId)
    const companyUser = await User.findById(job.userId).select("name");

    const companyName =
      companyUser?.name || "our organization";

    const designation =
      job?.jobTitle || "the applied position";

    console.log("Here is my Sender User mail:", user.email);

    // Send email with login credentials
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"HR Team" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "You have been shortlisted 🎉",
      html: `
          <p>Dear ${user.name || "Candidate"},</p>

          <p>
            We are pleased to inform you that you have been
            <strong>shortlisted</strong> for the next stage of our recruitment process
            for the position of <strong>${designation}</strong> at
            <strong>${companyName}</strong>.
          </p>

          <p>Our team will reach out to you shortly with further details.</p>

          <br />
          <p>Best regards,</p>
          <p><strong>HR Team</strong></p>
          `,
    };

    if (user?.email) {
      await transporter.sendMail(mailOptions);
    }

    return res.status(200).json({
      success: true,
      message: "Application status updated to shortlisted",
      data: application,
    });

  } catch (error) {
    console.error("Accept Job Application Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Accept Shortlisted Application Status API
export const acceptShortlistedCandidates = async (req, res) => {
  try {
    const {
      applicationId,
      interviewDate,
      interviewTime,
      formDesignation,
    } = req.body;

    // 1️⃣ Validate input
    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: "Application ID is required",
      });
    }

    console.log("Here is applicationId:", applicationId);

    // 2️⃣ Find application first (optional but recommended)
    const application = await JobApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Job application not found",
      });
    }

    // 3️⃣ Validate current status (only allow applied → shortlisted)
    if (application.status !== "shortlisted") {
      return res.status(400).json({
        success: false,
        message: `Cannot sent interview invitation with status '${application.status}'`,
      });
    }

    // 4️⃣ Update status and interview details
    application.status = "invitation_sent";
    application.interviewDate = interviewDate;
    application.interviewTime = interviewTime;
    application.designation = formDesignation;
    await application.save();

    // 5️⃣ Fetch candidate details
    const user = await User.findById(application.userId).select("email name");

    // 🔹 NEW: Fetch job details using application.jobId
    const job = await JobPosting.findById(application.jobId).select(
      "jobTitle userId"
    );

    // 🔹 NEW: Fetch company name from company user (job.userId)
    const companyUser = await User.findById(job.userId).select("name");

    const companyName =
      companyUser?.name || "our organization";

    const designation =
      job?.jobTitle || "the applied position";

    console.log("Here is my Sender User mail:", user.email);

    // Send email with login credentials
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"HR Team" <${process.env.EMAIL_USER}>`,
      to: user.email,
      // to: "avik@2sglobal.co",
      subject: `Interview Invitation – ${formDesignation} at ${companyName}`,
      html: `
        <p>Dear ${user.name || "Candidate"},</p>

        <p>
          As discussed earlier, we would like to invite you to attend an interview for the position of
          <strong>${designation}</strong> at <strong>${companyName}</strong>.
        </p>

        <p>
          <strong>Interview Details:</strong><br />
          <strong>Position:</strong> ${designation}<br />
          <strong>Date:</strong> ${new Date(interviewDate).toDateString()}<br />
          <strong>Time:</strong> ${interviewTime}
        </p>

        <p>
          The interview will focus on assessing your technical skills, experience, and overall suitability for the role.
          Kindly ensure your availability at the scheduled time.
        </p>

        <p>
          If you have any questions or require any clarification, please feel free to reply to this email.
          We request you to confirm your availability by responding to this invitation.
        </p>

        <p>We look forward to speaking with you.</p>

        <br />
        <p>Best regards,</p>
        <p><strong>HR Team</strong></p>
      `

    };

    if (user?.email) {
      await transporter.sendMail(mailOptions);
    }

    return res.status(200).json({
      success: true,
      message: "Application status updated to Invitation Sent",
      data: application,
    });

  } catch (error) {
    console.error("Accept Job Application Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Sent Offer to Candidates API
export const sentOfferToCandidates = async (req, res) => {
  try {
    const {
      applicationId,
      offer_letter_designation,
      offer_letter_joining_date,
      offer_letter_salary,
      offer_letter_message,
    } = req.body;

    // 1️⃣ Validate input
    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: "Application ID is required",
      });
    }

    console.log("Here is applicationId:", applicationId);

    // 2️⃣ Find application first (optional but recommended)
    const application = await JobApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Job application not found",
      });
    }

    // 3️⃣ Validate current status (only allow applied → shortlisted)
    if (application.status !== "invitation_sent") {
      return res.status(400).json({
        success: false,
        message: `Cannot sent offer letter with status '${application.status}'`,
      });
    }

    // 4️⃣ Update status and offer letter details
    application.status = "offer_sent";
    application.offer_letter_designation = offer_letter_designation;
    application.offer_letter_joining_date = offer_letter_joining_date;
    application.offer_letter_salary = offer_letter_salary;
    application.offer_letter_message = offer_letter_message;
    await application.save();

    // 5️⃣ Fetch candidate details
    const user = await User.findById(application.userId).select("email name");

    // 🔹 NEW: Fetch job details using application.jobId
    const job = await JobPosting.findById(application.jobId).select(
      "jobTitle userId"
    );

    // 🔹 NEW: Fetch company name from company user (job.userId)
    const companyUser = await User.findById(job.userId).select("name");

    const companyName =
      companyUser?.name || "our organization";

    const designation =
      job?.jobTitle || "the applied position";

    console.log("Here is my Sender User mail:", user.email);

    // Send email with login credentials
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"HR Team" <${process.env.EMAIL_USER}>`,
      to: user.email,
      // to: "avik@2sglobal.co",
      subject: `Offer Letter – ${offer_letter_designation}`,
      html: `
        <p>Dear ${user.name || "Candidate"},</p>

        <p>
          We are pleased to extend an offer of employment to you for the position of
          <strong>${offer_letter_designation}</strong> at <strong>${companyName}</strong>.
        </p>

        <p>
          <strong>Offer Details:</strong><br />
          <strong>Designation:</strong> ${offer_letter_designation}<br />
          <strong>Proposed Joining Date:</strong> ${new Date(
        offer_letter_joining_date
      ).toDateString()}<br />
          <strong>Salary:</strong> ₹${offer_letter_salary}
        </p>

        ${offer_letter_message
          ? `<p>${offer_letter_message}</p>`
          : ""
        }

        <p>
          Kindly confirm your acceptance of this offer by replying to this email.
          Further onboarding details will be shared upon confirmation.
        </p>

        <br />
        <p>Best regards,</p>
        <p><strong>HR Team</strong></p>
        <p>${companyName}</p>
      `

    };

    if (user?.email) {
      await transporter.sendMail(mailOptions);
    }

    return res.status(200).json({
      success: true,
      message: "Application status updated to Offer Sent",
      data: application,
    });

  } catch (error) {
    console.error("Accept Job Application Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMyAppliedJobs = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID missing" });
    }

    const applications = await JobApplication.find({
      userId,
      isDel: false
    })
      .sort({ appliedAt: -1 }); // latest first

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });

  } catch (error) {
    console.error("getMyAppliedJobs error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Save Interview Feedback API
export const submitInterviewFeedback = async (req, res) => {
  try {
    const {
      applicationId,
      communicationSkillScore,
      technicalSkillScore,
      aptitudeScore,
      overallScore,
      message,
    } = req.body;

    // interviewerId comes from auth middleware
    const interviewerId = req.userId;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: "Application ID is required",
      });
    }

    const feedback = await InterviewFeedback.create({
      applicationId,
      interviewerId,
      communicationSkillScore,
      technicalSkillScore,
      aptitudeScore,
      overallScore,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Interview feedback submitted successfully",
      data: feedback,
    });

  } catch (error) {
    console.error("Submit Interview Feedback Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
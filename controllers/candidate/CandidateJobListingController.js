import User from "../../models/userModel.js";
import CompanyDetails from "../../models/company_Models/companydetails.js";
import SavedJob from "../../models/SavedJob.js";
import JobPosting from "../../models/company_Models/JobPostingModel.js";
import list_job_experience_level from "../../models/ListJobExperienceLevelModel.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
dayjs.extend(relativeTime);

import list_india_cities from "../../models/monogo_query/indiaCitiesModel.js";

export const getAllJobList = async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const today = new Date();

  // Fetch jobs for this user where status is "completed" and expiryDate is not passed
  const jobs = await JobPosting.find({
    status: "completed",
    is_del: false,
    jobExpiryDate: { $gte: today },
  })
    .populate("jobType", "name")
    .populate("country", "name")
    .populate("city", "city_name")
    .populate("branch", "name")
    .populate("experienceLevel", "name")
    .select(
      "_id userId jobTitle jobType jobLocationType advertiseCity advertiseCityName country city branch createdAt jobExpiryDate salary"
    )
    .sort({ createdAt: -1 })
    .lean();

  // Step 2: Extract all unique userIds from jobs
  const employerIds = [...new Set(jobs.map((job) => job.userId?.toString()))];

  // Step 3: Fetch company details for all those userIds at once
  const companies = await CompanyDetails.find({
    userId: { $in: employerIds },
  })
    .select("userId name logo")
    .lean();

  // Step 4: Build a quick lookup map for company info
  const companyMap = {};
  companies.forEach((company) => {
    companyMap[company.userId.toString()] = {
      companyName: company.name || "",
      logo: company.logo || "",
    };
  });

  // Build response
  const jobList = jobs.map((job) => {
    const companyInfo = companyMap[job.userId?.toString()] || {
      companyName: user?.name || "",
      logo: "",
    };

    let location = "";
    let advertiseCityName = "";

    // Remote job logic
    if (job.jobLocationType === "remote") {
      location = "Remote";
      advertiseCityName =
        job.advertiseCity === "Yes" ? job.advertiseCityName || "" : "";
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
      jobExperienceLevel: job?.experienceLevel?.name || "",
      jobLocationType: job.jobLocationType,
      location,
      advertiseCityName,
      salary: job.salary || "",
      // createdAt: formatDate(job.createdAt),
      // expiryDate: formatDate(job.jobExpiryDate),
      createdAgo: dayjs(job.createdAt).fromNow(),
      // isActive: !job.jobExpiryDate || new Date(job.jobExpiryDate) >= today,
      companyName: companyInfo.companyName || "",
      logo: companyInfo.logo || "",
    };
  });

  res.status(200).json({
    success: true,
    message: "Job listing fetched successfully.",
    data: jobList,
  });
};

export const jobsearchFilters = async (req, res) => {
  try {
    const { keyword, city, range } = req.body;

    let cityIds = [];
    if (city) {
      const cityRecord = await list_india_cities.findById(city);

      if (!cityRecord) {
        return res.status(404).json({
          success: false,
          message: "City not found",
        });
      }

      cityIds.push(cityRecord._id);

      // If range is provided, find nearby cities within that range (in km)
      if (
        range &&
        cityRecord.location &&
        cityRecord.location.coordinates.length === 2
      ) {
        // console.log("Finding nearby cities within range:", range);

        const nearbyCities = await list_india_cities.find({
          location: {
            $nearSphere: {
              $geometry: {
                type: "Point",
                coordinates: cityRecord.location.coordinates,
              },
              $maxDistance: range * 1000,
            },
          },
          _id: { $ne: cityRecord._id },
        });

        cityIds.push(...nearbyCities.map((c) => c._id));
        // console.log("Nearby city IDs:", cityIds);
      }
    }

    res.status(200).json({
      success: true,
      message: "Job listing fetched successfully.",
      data: {},
      debug: { keyword, city, range, cityIds },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// SAVED JOB ========================================


export const saveJob = async (req, res) => {
  try {
    const userId = req.userId;
    const { jobId } = req.body;

    /* Validate user */
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /* Validate job */
    const job = await Job.findById(jobId);
    if (!job || job.is_del) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    /* Prevent duplicate save */
    const alreadySaved = await SavedJob.findOne({ userId, jobId });
    if (alreadySaved) {
      return res.status(409).json({
        success: false,
        message: "Job already saved",
      });
    }

    await SavedJob.create({
      userId,
      jobId,
    });

    return res.json({
      success: true,
      message: "Job saved successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to save job",
    });
  }
};



export const removeSavedJob = async (req, res) => {
  try {
    const userId = req.userId;
    const { savedJobId } = req.params;

    const savedJob = await SavedJob.findOne({
      _id: savedJobId,
      userId,
    });

    if (!savedJob) {
      return res.status(404).json({
        success: false,
        message: "Saved job not found",
      });
    }

    await SavedJob.deleteOne({ _id: savedJobId });

    return res.json({
      success: true,
      message: "Job removed from saved list",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to remove saved job",
    });
  }
};



export const getMySavedJobs = async (req, res) => {
  try {
    const userId = req.userId;

    const savedJobs = await SavedJob.find({ userId })
      .populate("jobId")
      .sort({ savedAt: -1 });

    return res.json({
      success: true,
      data: savedJobs.map(item => ({
        savedJobId: item._id,
        savedAt: item.savedAt,
        job: item.jobId,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch saved jobs",
    });
  }
};

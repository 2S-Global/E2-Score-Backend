import User from "../../models/userModel.js";
import CompanyDetails from "../../models/company_Models/companydetails.js";
import JobPosting from "../../models/company_Models/JobPostingModel.js";
import list_job_experience_level from "../../models/ListJobExperienceLevelModel.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
dayjs.extend(relativeTime);

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
        jobExpiryDate: { $gte: today }
    })
        .populate("jobType", "name")
        .populate("country", "name")
        .populate("city", "city_name")
        .populate("branch", "name")
        .populate("experienceLevel", "name")
        .select("_id userId jobTitle jobType jobLocationType advertiseCity advertiseCityName country city branch createdAt jobExpiryDate salary")
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
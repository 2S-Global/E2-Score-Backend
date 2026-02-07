import Transaction from "../../models/transactionModel.js";
import User from "../../models/userModel.js";
import UserVerification from "../../models/userVerificationModel.js";
import mongoose from "mongoose";
import CompanyPackage from "../../models/companyPackageModel.js";
import JobApplication from "../../models/jobApplicationModel.js";
import Job from "../../models/company_Models/JobPostingModel.js";

/**
 * @route POST /api/dashboard/getTotal
 * @summary getting the totals of all blocks in admin dashboard
 * @description This endpoint gives the total number of data for admin authenticated user.
 * @security BearerAuth
 * @returns {object} 200 - Data Fetched successfully!
 * @returns {object} 500 - Error fetching Data
 */

export const getTotal = async (req, res) => {
  try {
    const [
      totalCompany,
      totalInstitution,
      totalCandidate
    ] = await Promise.all([
      User.countDocuments({ role: 2,is_del:false }), // Users with role_id = 1
      User.countDocuments({ role: 3,is_del:false }), // Fully verified users
      User.countDocuments({ role: 1,is_del:false }), // Pending verification users
    ]);

    const TotalPayment = '0.00';


    res.status(200).json({
      success: true,
      totalCompany,
      totalInstitution,
      totalCandidate,
      TotalPayment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @route POST /api/dashboard/getMonthlyCompanyDetails
 * @summary getting the totals of all registered companies along with month
 * @description This endpoint gives totals of all registered companies along with month for admin authenticated user. It used in graph
 * @security BearerAuth
 * @returns {object} 200 - Data Fetched successfully!
 * @returns {object} 500 - Error fetching Data
 */
export const getMonthlyCompanyDetails = async (req, res) => {
  try {
    const now = new Date();
    const startDate = new Date();
    startDate.setMonth(now.getMonth() - 11); // Last 12 months including current

    // Step 1: Aggregate monthly user data
    const monthlyData = await User.aggregate([
      {
        $match: {
          role: 2,
          is_del: false,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          total: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          total: 1
        }
      }
    ]);

    // Step 2: Convert data to a Map for faster lookup
    const dataMap = new Map();
    monthlyData.forEach(item => {
      dataMap.set(`${item.year}-${item.month}`, item.total);
    });

    // Step 3: Generate result for last 12 months
    const monthNames = [
      "", "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];


    let totalSum = 0;
for (let i = 11; i >= 0; i--) {
const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const total = dataMap.get(`${year}-${month}`) || 0;
  totalSum += total;
}

    const result = [];


    for (let i = 11; i >= 0; i--) {
const date = new Date(now.getFullYear(), now.getMonth() - i, 1); // Safe and immutable


      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 1-based month

      const total = dataMap.get(`${year}-${month}`) || 0;
     const percentage = totalSum ? (total / totalSum) * 100 : 0;

      result.push({
        year,
        month,
        monthName: monthNames[month],
        total,
        percentage:+percentage.toFixed(2)
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error in getMonthlyCompanyDetails:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


/**
 * @route POST /api/dashboard/getMonthlyRegistered
 * @summary getting the totals of all registered users along with month
 * @description This endpoint gives totals of all registered users along with month for admin authenticated user. It used in graph
 * @security BearerAuth
 * @returns {object} 200 - Data Fetched successfully!
 * @returns {object} 500 - Error fetching Data
 */
export const getMonthlyRegistered = async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5); // Last 6 months incl. current

    const monthlyData = await UserVerification.aggregate([
      {
        $match: {
          all_verified: 1,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          total: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          total: 1
        }
      }
    ]);

    // Generate last 6 months with default 0
    const result = [];
    const monthNames = [
      "", "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(now.getMonth() - i);

      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const match = monthlyData.find(
        (item) => item.year === year && item.month === month
      );

      result.push({
        year,
        month,
        monthName: monthNames[month],
        total: match ? match.total : 0
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


/**
 * @route POST /api/dashboard/getMonthlyCandidateDetails
 * @summary getting the totals of all candidates users along with month
 * @description This endpoint gives totals of all registered candidates along with month for admin authenticated user. It used in graph
 * @security BearerAuth
 * @returns {object} 200 - Data Fetched successfully!
 * @returns {object} 500 - Error fetching Data
 */

export const getMonthlyCandidateDetails = async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5); // Last 6 months including current

    const monthlyData = await User.aggregate([
      {
        $match: {
          role: 1,
          is_del: false,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          total: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          total: 1
        }
      }
    ]);

    // Step 2: Convert results to map for quick access
    const dataMap = new Map();
    monthlyData.forEach(item => {
      dataMap.set(`${item.year}-${item.month}`, item.total);
    });

    const monthNames = [
      "", "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const result = [];


    // Step 3: Final result for last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const total = dataMap.get(`${year}-${month}`) || 0;

      result.push({
        year,
        month,
        monthName: monthNames[month],
        total
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error in getMonthlyCandidateDetails:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


/**
 * @route POST /api/dashboard/getMonthlyInstitutionsDetails
 * @summary getting the totals of all institution users along with month
 * @description This endpoint gives totals of all registered institution along with month for admin authenticated user. It used in graph
 * @security BearerAuth
 * @returns {object} 200 - Data Fetched successfully!
 * @returns {object} 500 - Error fetching Data
 */

export const getMonthlyInstitutionsDetails = async (req, res) => {
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(now.getMonth() - 11); // Last 12 months including current

    const monthlyData = await User.aggregate([
      {
        $match: {
          role: 3,
          is_del: false,
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          total: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          total: 1
        }
      }
    ]);

    // Step 2: Convert to a Map for quick access
    const dataMap = new Map();
    monthlyData.forEach(item => {
      dataMap.set(`${item.year}-${item.month}`, item.total);
    });

    const monthNames = [
      "", "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const result = [];

    // Step 3: Calculate total sum
    let totalSum = 0;
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const total = dataMap.get(`${year}-${month}`) || 0;
      totalSum += total;
    }

    // Step 4: Final result array with percentages
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const total = dataMap.get(`${year}-${month}`) || 0;
      const percentage = totalSum ? (total / totalSum) * 100 : 0;

      result.push({
        year,
        month,
        monthName: monthNames[month],
        total,
        percentage: +percentage.toFixed(2)
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error in getMonthlyInstitutionsDetails:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getTotalFrontend = async (req, res) => {
  try {
    // const user_id = req.userId;
const user_id = new mongoose.Types.ObjectId(req.userId);
    // Get the company package for this employer
    const companyPackage = await CompanyPackage.findOne({
      companyId: user_id,
      is_del: false
    });

    const totalSelectedPlans = companyPackage?.selected_plan?.length || 0;

    const [
      totalActiveVerification,
      totalPendingVerifications,
      totalTransactionAmountAgg
    ] = await Promise.all([
      // Fully verified users under this employer
      UserVerification.countDocuments({ all_verified: 1, employer_id: user_id }),

      // Pending verifications under this employer
      UserVerification.countDocuments({
        all_verified: { $in: [0, null] },
        employer_id: user_id
      }),

      // Total transaction amount under this employer
      Transaction.aggregate([
        {
          $match: {
            employer_id: user_id,

          }
        },
        {
          $group: {
      _id: 0,
      total: { $sum: "$amount" } // assuming amount is already stored as number
    }
        },
        {
          $project: {
            _id: 0,
            total: 1
          }
        }
      ])
    ]);

   // const totalTransactionAmount = totalTransactionAmountAgg[0]?.total || 0;
    const totalTransactionAmount = parseFloat((totalTransactionAmountAgg[0]?.total || 0).toFixed(2));

    res.status(200).json({
      success: true,
      totalSelectedPlans,
      totalActiveVerification,
      totalPendingVerifications,
      totalTransactionAmount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


/**
 * @route POST /api/dashboard/getMonthlyUserDetails
 * @summary getting the totals of all  users along with month
 * @description This endpoint gives totals of all users along with month for admin authenticated user. It used in graph
 * @security BearerAuth
 * @returns {object} 200 - Data Fetched successfully!
 * @returns {object} 500 - Error fetching Data
 */



export const getMonthlyUserDetails = async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5); // Last 6 months incl. current

    const monthlyData = await User.aggregate([
      {
        $match: {
         // role: 1,
          is_del: false,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          total: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          total: 1
        }
      }
    ]);

    // Generate last 6 months with default 0
    const result = [];
    const monthNames = [
      "", "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(now.getMonth() - i);

      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const match = monthlyData.find(
        (item) => item.year === year && item.month === month
      );

      result.push({
        year,
        month,
        monthName: monthNames[month],
        total: match ? match.total : 0
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getMonthlyUserVerificationsFrontend = async (req, res) => {
  try {
    const user_id = new mongoose.Types.ObjectId(req.userId);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    let startYear, endYear;

    if (currentMonth < 4) {
      startYear = currentYear - 1;
      endYear = currentYear;
    } else {
      startYear = currentYear;
      endYear = currentYear + 1;
    }

    const startDate = new Date(`${startYear}-04-01T00:00:00.000Z`);
    const endDate = new Date(`${endYear}-03-31T23:59:59.999Z`);

    const monthlyData = await UserVerification.aggregate([
      {
        $match: {
          employer_id: user_id,
          all_verified: 1,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          total: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          total: 1
        }
      }
    ]);

    const result = [];
    const monthNames = [
      "", "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    for (let i = 0; i < 12; i++) {
      const date = new Date(startYear, 3 + i); // Start from April
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const match = monthlyData.find(
        (item) => item.year === year && item.month === month
      );

      result.push({
        year,
        month,
        monthName: `${monthNames[month]} ${year}`,
        monthLabel: `${monthNames[month]} ${year}`, // Correct label
        total: match ? match.total : 0
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getLatestApplicants = async (req, res) => {
  try {
    const userId = req.userId;

    // 1️⃣ Get jobs posted by logged-in user
    const myJobs = await Job.find(
      { userId: userId, is_del: false },
      { _id: 1 }
    );

    if (!myJobs.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const jobIds = myJobs.map(job => job._id);

    // 2️⃣ Get applicants for those jobs
    const appliedCandidates = await JobApplication.aggregate([
      {
        $match: {
          jobId: { $in: jobIds },
           status: "applied", // ✅ only applied candidates
          isDel: false,
        },
      },
  // ✅ ADD THIS
  {
    $sort: { appliedAt: -1 },
  },


      // 🔹 User
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

      // 🔹 Personal Details
      {
        $lookup: {
          from: "personaldetails",
          localField: "userId",
          foreignField: "userId",
          as: "personalDetails",
        },
      },
      { $unwind: { path: "$personalDetails", preserveNullAndEmptyArrays: true } },

      // 🔹 Candidate Details
      {
        $lookup: {
          from: "candidatedetails",
          localField: "userId",
          foreignField: "userId",
          as: "candidateDetails",
        },
      },
      { $unwind: { path: "$candidateDetails", preserveNullAndEmptyArrays: true } },

      // 🔹 Career
      {
        $lookup: {
          from: "usercareers",
          localField: "userId",
          foreignField: "userId",
          as: "career",
        },
      },
      { $unwind: { path: "$career", preserveNullAndEmptyArrays: true } },

      // 🔹 Convert JobRole string → ObjectId
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

      // 🔹 Job Role Master
      {
        $lookup: {
          from: "list_job_roles",
          localField: "jobRoleObjectId",
          foreignField: "_id",
          as: "jobRoleData",
        },
      },
      { $unwind: { path: "$jobRoleData", preserveNullAndEmptyArrays: true } },

      // ✅ SAME RESPONSE AS BEFORE
      {
        $project: {
          _id: 1,
          jobId: 1,
          userId: 1,
          status: 1,
          noticePeriod: 1,
          experienceLevel: 1,
          preferredTime: 1,
          availabilityOnSaturday: 1,
          willingToRelocate: 1,

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



export const getEmployerDashboardStats = async (req, res) => {
  try {
    const userId = req.userId;

    // 1️⃣ Total jobs posted by me
    const totalJobs = await Job.countDocuments({
      userId: userId,
      is_del: false,
    });

    // Get my job IDs
    const myJobs = await Job.find(
      { userId: userId, is_del: false },
      { _id: 1 }
    );

    const jobIds = myJobs.map(job => job._id);

    // If no jobs, return zero stats
    if (!jobIds.length) {
      return res.status(200).json({
        success: true,
        data: {
          totalJobs: 0,
          totalApplicants: 0,
          totalShortlisted: 0,
          totalRejected: 0,
        },
      });
    }

    // 2️⃣ Total applicants for my jobs
    const totalApplicants = await JobApplication.countDocuments({
      jobId: { $in: jobIds },
      isDel: false,
    });

    // 3️⃣ Total shortlisted candidates
    const totalShortlisted = await JobApplication.countDocuments({
      jobId: { $in: jobIds },
      isDel: false,
      status: "shortlisted",
    });

    // 4️⃣ Total rejected candidates
    const totalRejected = await JobApplication.countDocuments({
      jobId: { $in: jobIds },
      isDel: false,
      status: "rejected",
    });

    return res.status(200).json({
      success: true,
      data: {
        totalJobs,
        totalApplicants,
        totalShortlisted,
        totalRejected,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const getMonthlyApplicantsStats = async (req, res) => {
  try {
    const userId = req.userId;

    // 1️⃣ Build last 6 months array
    const months = [];
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const now = new Date();
    now.setDate(1); // normalize

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);

      months.push({
        key: `${d.getFullYear()}-${d.getMonth() + 1}`,
        month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        totalApplicants: 0,
      });
    }

    // 2️⃣ Get employer job IDs
    const jobs = await Job.find(
      { userId: userId, is_del: false },
      { _id: 1 }
    );

    const jobIds = jobs.map(job => job._id);

    if (!jobIds.length) {
      return res.status(200).json({
        success: true,
        data: months.map(({ month, totalApplicants }) => ({
          month,
          totalApplicants,
        })),
      });
    }

    // 3️⃣ Aggregate real data
    const startDate = new Date(months[0].key + "-01");

    const stats = await JobApplication.aggregate([
      {
        $match: {
          jobId: { $in: jobIds },
          isDel: false,
          appliedAt: { $gte: startDate },
        },
      },
      {
        $addFields: {
          appliedDate: { $ifNull: ["$appliedAt", "$createdAt"] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$appliedDate" },
            month: { $month: "$appliedDate" },
          },
          totalApplicants: { $sum: 1 },
        },
      },
    ]);

    // 4️⃣ Merge aggregation result with months list
    stats.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      const index = months.findIndex(m => m.key === key);
      if (index !== -1) {
        months[index].totalApplicants = item.totalApplicants;
      }
    });

    // 5️⃣ Final response
    return res.status(200).json({
      success: true,
      data: months.map(({ month, totalApplicants }) => ({
        month,
        totalApplicants,
      })),
    });
  } catch (error) {
    console.error("Monthly applicants stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

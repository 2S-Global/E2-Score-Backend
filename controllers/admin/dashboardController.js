import Transaction from "../../models/transactionModel.js";
import User from "../../models/userModel.js";
import UserVerification from "../../models/userVerificationModel.js";
import mongoose from "mongoose";
import CompanyPackage from "../../models/companyPackageModel.js";


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
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 11); // Last 6 months incl. current

    const monthlyData = await User.aggregate([
      {
        $match: {
          role: 2,
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

    for (let i = 11; i >= 0; i--) {
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
    sixMonthsAgo.setMonth(now.getMonth() - 5); // Last 6 months incl. current

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
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 11); // Last 6 months incl. current

    const monthlyData = await User.aggregate([
      {
        $match: {
          role: 3,
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

    for (let i = 11; i >= 0; i--) {
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


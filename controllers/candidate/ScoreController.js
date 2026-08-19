import { apiResponse } from "../../utility/apiResponse.js";
import CibilModel from "../../models/Score/CibilScoreMode.js";
import ExperianModel from "../../models/Score/ExperianModel.js";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../../services/paymentService.js";
import {
  getCibilScore,
  getExperianScore,
} from "../../services/creditScoreService.js";
import User from "../../models/userModel.js";
import CandidateKYC from "../../models/CandidateKYCModel.js";
import CandidateDetails from "../../models/CandidateDetailsModel.js";


const CREDIT_SCORE_PRICES = {
  CIBIL: 7,
  EXPERIAN: 5,
};


export const createPayment = async (req, res) => {
  try {
    const { type = "CIBIL" } = req.body;

    const reportType = String(type).toUpperCase();

    const amountInRupees = CREDIT_SCORE_PRICES[reportType];

    if (amountInRupees === undefined) {
      return apiResponse(res, 400, false, "Invalid credit report type", null);
    }

    const amountInPaise = amountInRupees * 100;

    const order = await createRazorpayOrder(amountInPaise, "INR");

    console.log("is it working ==>", order);

    return apiResponse(res, 200, true, "Order created successfully", {
      orderId: order.id,

      // Send paise to frontend because Razorpay checkout expects paise
      amount: amountInPaise,

      currency: "INR",
    });
  } catch (error) {
    return apiResponse(res, 500, false, "Order creation failed", null);
  }
};



export const verifyPaymentAndGetScore = async (req, res) => {
  const userId = `6937bc0115b0e2b4b04389fd`;
  if (!userId) {
    return apiResponse(
      res,
      401,
      false,
      "Unauthorized: User ID not found in request context or body",
      null,
    );
  }
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      type = "CIBIL",
    } = req.body;


    // FOR MOCK TESTING (uncomment this if you want to bypass verification)
    /*
    payment = {
      success: true,
      paymentId: razorpay_payment_id || "test_payment_id",
      orderId: razorpay_order_id || "test_order_id"
    };
    */

    // FOR ACTUAL VERIFICATION:

    const paymentVerification = verifyRazorpayPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });


    console.log('is this good enough ====>', paymentVerification)

    if (!paymentVerification.success) {
      return apiResponse(
        res,
        400,
        false,
        "Payment verification failed",
        paymentVerification.message,
      );
    }
    const payment = {
      paymentId: paymentVerification.paymentId,
      orderId: paymentVerification.orderId,
    };



    const reportType = String(type).toUpperCase();


    const user = await User.findById(userId).select("name phone_number");
    let phone_number = user?.phone_number;

    if (phone_number.length > 10) {
      phone_number = phone_number.slice(-10);
    }


    const KYC = await CandidateKYC.findOne({ userId }).select("pan_number");
    const Details = await CandidateDetails.findOne({ userId }).select("dob");

    if (!user) {
      return apiResponse(res, 404, false, "User not found", null);
    }


    const panNumber = KYC?.pan_number || "";


    const formattedDOB = Details?.dob ? new Date(Details.dob).toISOString().split('T')[0] : "";


    const nameParts = user.name ? user.name.trim().split(/\s+/) : [];
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";



    const payloadBUILDER = {
      mobile_no: phone_number || "",
      pan: panNumber || "",
      first_name: firstName || "",
      last_name: lastName || "",
      dob: formattedDOB || ""
    };

    console.log('test the payload', payloadBUILDER);

    if (reportType === "CIBIL") {
      // 2. Fetch CIBIL score
      const cibilData = await getCibilScore(payloadBUILDER);
      // const cibilData = {
      //   score: 90
      // }

      // 3. Save CIBIL result in DB
      await CibilModel.create({
        userId,
        paymentId: payment.paymentId,
        paymentDate: new Date(),
        status: "SUCCESS",
        Score: String(cibilData.score),
      });

      // 4. Return response
      return apiResponse(
        res,
        200,
        true,
        "Credit score fetched successfully",
        cibilData,
      );
    } else if (reportType === "EXPERIAN") {
      // 2. Fetch Experian score using the builded payload instead of req.body
      const experianData = await getExperianScore(payloadBUILDER);

      // 3. Save Experian result in DB
      await ExperianModel.create({
        userId,
        paymentId: payment.paymentId,
        paymentDate: new Date(),
        Score: String(experianData.score),
      });

      // 4. Return response
      return apiResponse(
        res,
        200,
        true,
        "Credit score fetched successfully",
        experianData,
      );
    } else {
      return res.status(400).json({
        success: false,
        message: `Invalid credit report type: ${type}. Must be CIBIL or EXPERIAN.`,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getMyScores = async (req, res) => {
  // const userId = req.userId
  const userId = `6a5876900f6c2c9903ab73ec`;
  const { type } = req.params;

  try {
    if (type.toUpperCase() == "CIBIL") {
      const myCibilScore = await CibilModel.findOne({ userId })
        .sort({ createdAt: -1 })
        .limit(1)
        .select("score  paymentDate");
      return apiResponse(
        res,
        200,
        true,
        "Cibil score fetched successfully",
        myCibilScore,
      );
    } else {
      const myExperianScore = await ExperianModel.findOne({ userId })
        .sort({ createdAt: -1 })
        .limit(1)
        .select("score  paymentDate");
      return apiResponse(
        res,
        200,
        true,
        "Experian score fetched successfully",
        myExperianScore,
      );
    }
  } catch (error) {
    return apiResponse(
      res,
      500,
      false,
      error.message || "Error in fetching score",
      null,
    );
  }
};

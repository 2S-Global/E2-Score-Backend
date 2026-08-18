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

//CREDIT_SCORE_PRICES
//VERY IMPORTANT => if api changes then change here
const CREDIT_SCORE_PRICES = {
  CIBIL: 7,
  EXPERIAN: 5,
};

//create payment
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

//Controller to verify Razorpay payment
//and fetch the requested credit score
//(CIBIL/Experian) synchronously.

export const verifyPaymentAndGetScore = async (req, res) => {
  const userId = `6a5876900f6c2c9903ab73ec`;
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

    // 1. Verify payment
    const payment = verifyRazorpayPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!payment.success) {
      return apiResponse(
        res,
        400,
        false,
        "Payment verification failed",
        payment.message,
      );
    }

    const reportType = String(type).toUpperCase();

    if (reportType === "CIBIL") {
      // 2. Fetch CIBIL score
      const cibilData = await getCibilScore(req.body);
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
      // 2. Fetch Experian score
      const experianData = await getExperianScore(req.body);

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

//Controller to fetch CIBIL score directly without payment verification (legacy/compatibility).

export const CibilScore = async (req, res) => {
  try {
    const request = req.body;
    if (!request || typeof request !== "object" || Array.isArray(request)) {
      return res.status(400).json({
        success: false,
        error: "Invalid request body",
      });
    }

    const cibilData = await getCibilScore(request);
    return res.status(200).json({
      success: true,
      data: cibilData.data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      status: error.response?.status || null,
      response: error.response?.data || null,
    });

    /* return res.status(500).json({
      success: false,
      error: error.message,
    }); */
  }
};

//Controller to fetch Experian score directly without payment verification (legacy/compatibility).

export const ExperianScore = async (req, res) => {
  try {
    const request = req.body;
    if (!request || typeof request !== "object" || Array.isArray(request)) {
      return apiResponse(res, 400, false, "Invalid request body", null);
    }

    const experianData = await getExperianScore(request);
    return apiResponse(
      res,
      200,
      true,
      "Experian score fetched successfully",
      experianData.data,
    );
  } catch (error) {
    return apiResponse(
      res,
      500,
      false,
      error.message || "Error in fetching Experian score",
      null,
    );
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

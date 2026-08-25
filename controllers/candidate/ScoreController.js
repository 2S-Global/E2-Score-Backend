import { apiResponse } from "../../utility/apiResponse.js";
import CibilModel from "../../models/Score/CibilScoreModel.js";
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
import { verifyPaymentSchema } from "./validate/verifyPaymentSchema.js";
import Fees from "../../models/feesModel.js";



export const createPayment = async (req, res) => {
  try {
    const { type = "CIBIL" } = req.body;

    const reportType = String(type).toUpperCase();

    if (reportType !== "CIBIL" && reportType !== "EXPERIAN") {
      return apiResponse(res, 400, false, "Invalid credit report type", null);
    }

    // Fetch dynamic fees from database
    const fees = await Fees.findOne({});
    let amountInRupees;
    if (reportType === "CIBIL") {
      amountInRupees = Number(fees?.cibil_fees ?? 25);
    } else {
      amountInRupees = Number(fees?.experian_fees ?? 30);
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
  const userId = req.userId;
  // const userId = `6937bc0115b0e2b4b04389fd`;

  if (!userId) {
    return apiResponse(res, 401, false, "Unauthorized: User ID not found in request context or body", null);
  }
  try {
    const result = verifyPaymentSchema.safeParse(req.body)

    if (!result.success) {
      return apiResponse(res, 422, false, 'Invalid data', result.error.issues[0].message)
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, type } = result.data;

    const paymentVerification = verifyRazorpayPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

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

    const existingCibilPayment = await CibilModel.findOne({
      paymentId: payment.paymentId,
    });


    if (existingCibilPayment) {
      return apiResponse(res, 409, false, "Payment has already been used", null);
    }

    const reportType = String(type).toUpperCase();

    const user = await User.findById(userId).select("name phone_number");
    if (!user) {
      return apiResponse(res, 404, false, "User not found", null);
    }

    // Protect against null/undefined phone number crashing the server
    let phone_number = user.phone_number || "";
    if (phone_number && phone_number.length > 10) {
      phone_number = phone_number.slice(-10);
    }

    const KYC = await CandidateKYC.findOne({ userId }).select("pan_number");
    const Details = await CandidateDetails.findOne({ userId }).select("dob");

    const panNumber = KYC?.pan_number || "";

    // Protect against invalid dates in database crashing the server during toISOString() conversion
    let formattedDOB = "";
    if (Details?.dob) {
      const dobDate = new Date(Details.dob);
      if (!isNaN(dobDate.getTime())) {
        formattedDOB = dobDate.toISOString().split('T')[0];
      }
    }

    const nameParts = user.name ? user.name.trim().split(/\s+/) : [];
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const payloadBUILDER = {
      mobile_number: phone_number,
      first_name: firstName,
      last_name: lastName,
    };

    if (reportType === "CIBIL") {
      // 2. Fetch CIBIL score
      const cibilData = await getCibilScore(payloadBUILDER, userId);
      console.log('cibilDatacibilDatacibilDatacibilDatacibilData===>', cibilData)

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
      const existingExperianPayment = await ExperianModel.findOne({
        paymentId: payment.paymentId,
      });

      if (existingExperianPayment) {
        return apiResponse(res, 409, false, "Payment has already been used", null);
      }
      const payload_EXPERIAN = {
        mobile_no: phone_number,
        pan: panNumber,
        first_name: firstName,
        last_name: lastName,
        dob: formattedDOB
      };

      const experianData = await getExperianScore(payload_EXPERIAN, userId);
      console.log("experianData", experianData)
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
      return apiResponse(
        res,
        400,
        false,
        `Invalid credit report type: ${type}. Must be CIBIL or EXPERIAN.`,
        null
      );
    }
  } catch (error) {
    return apiResponse(
      res,
      500,
      false,
      error.message || "An internal server error occurred",
      null
    );
  }
};

export const getMyScores = async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return apiResponse(res, 401, false, "Unauthorized: User ID not found in request context or body", null);
  }

  const { type } = req.params;

  try {
    if (type.toUpperCase() == "CIBIL") {
      const myCibilScore = await CibilModel.findOne({ userId }).sort({ createdAt: -1 }).limit(1).select("Score  paymentDate");
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
        .select("Score  paymentDate");
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

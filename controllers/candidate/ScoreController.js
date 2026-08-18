import axios from "axios";
import { apiResponse } from "../../utility/apiResponse.js";

export const CibilScore = async (req, res) => {
  const API_URL = process.env.CIBIL_URL + "/srv2/credit-report/check-score";
  try {
    const request = req.body;
    // Basic request validation
    if (!request || typeof request !== "object" || Array.isArray(request)) {
      return res.status(400).json({
        success: false,
        error: "Invalid request body",
      });
    }
    const sendRequest = {
      ...request,
      api_id: process.env.CIBIL_API_ID,
      api_key: process.env.CIBIL_API_KEY,
      token_id: process.env.CIBIL_TOKEN_ID,
    };
    console.log("CIBIL URL:", API_URL);

    console.log("CIBIL REQUEST:", JSON.stringify(sendRequest, null, 2));
    const response = await axios.post(API_URL, sendRequest, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 60000,
    });
    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Status:", error.response?.status);
    console.error("Response:", error.response?.data);
    console.error("Headers:", error.response?.headers);
    console.error("Request URL:", API_URL);

    return res.status(error.response?.status || 500).json({
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

export const ExperianScore = async (req, res) => {
  let API_URL = process.env.CIBIL_URL + "/srv2/credit-report/experian";

  try {
    const request = req.body;
    // Basic request validation
    if (!request || typeof request !== "object" || Array.isArray(request)) {
      return apiResponse(res, 400, false, "Invalid request body", null);
    }

    const sendRequest = {
      ...request,
      api_id: process.env.CIBIL_API_ID,
      api_key: process.env.CIBIL_API_KEY,
      token_id: process.env.CIBIL_TOKEN_ID,
    };
    console.log("ExperianScore URL:", API_URL);

    console.log("ExperianScore REQUEST:", JSON.stringify(sendRequest, null, 2));
    const response = await axios.post(API_URL, sendRequest, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 60000,
    });

    return apiResponse(
      res,
      200,
      true,
      "Experian score fetched successfully",
      response.data,
    );
  } catch (error) {
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Status:", error.response?.status);
    console.error("Response:", error.response?.data);
    console.error("Headers:", error.response?.headers);
    console.error("Request URL:", API_URL);

    return res.status(error.response?.status || 500).json({
      success: false,
      error: error.message,
      status: error.response?.status || null,
      response: error.response?.data || null,
    });
    /* return apiResponse(
      res,
      500,
      false,
      "Error in fetching Experian score",
      null,
    ); */
  }
};

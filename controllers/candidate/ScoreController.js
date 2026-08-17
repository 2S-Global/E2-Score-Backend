import dotenv from "dotenv";

import User from "../../models/userModel.js";
dotenv.config();
export const CibilScore = async (req, res) => {
  const controller = new AbortController();
  const API_URL = process.env.CIBIL_URL;
  // 60-second request timeout
  const timeout = setTimeout(() => controller.abort(), 60_000);

  const MAX_RESPONSE_SIZE = 2 * 1024 * 1024; // 2 MB

  try {
    const request = req.body;
    const sendRequest = {
      ...request,
      api_id: process.env.CIBIL_API_ID,
      api_key: process.env.CIBIL_API_KEY,
      token_id: process.env.CIBIL_TOKEN_ID,
    };

    // Basic request validation
    if (!request || typeof request !== "object" || Array.isArray(request)) {
      return res.status(400).json({
        success: false,
        error: "Invalid request body",
      });
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(sendRequest),
      signal: controller.signal,
    });

    const responseText = await response.text();
    // Parse JSON response when possible
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = null;
    }

    // Upstream API Error
    if (!response.ok) {
      console.error("Credit API request failed", {
        status: response.status,
      });

      return res.status(502).json({
        success: false,
        error: "Credit score service unavailable",
        upstreamStatus: response.status,
      });
    }

    // Success
    return res.status(200).json({
      success: true,
      environment: ENVIRONMENT,
      data: responseData ?? responseText,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      console.error("Credit API request timed out");

      return res.status(504).json({
        success: false,
        error: "Credit score service timed out",
      });
    }

    // Never expose internal errors to clients
    console.error("Credit API error:", error?.message);

    return res.status(502).json({
      success: false,
      error: "Unable to process credit score request",
    });
  } finally {
    clearTimeout(timeout);
  }
};
